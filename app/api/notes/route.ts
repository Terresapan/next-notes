import { createNoteSchema } from "@/lib/validation/note";
import { updateNoteSchema } from "@/lib/validation/note";
import { deleteNoteSchema } from "@/lib/validation/note";
import { auth } from "@clerk/nextjs/server";
import Note from "@/lib/db/mongoose";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Internal Server Error" }, { status: 400 });
    }

    const { title, content } = parseResult.data;

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await Note.create({
      _id: new ObjectId(),
      title,
      content,
      userId,
      createdAt: new Date(),
    } as any);
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.log(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parseResult = updateNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Internal Server Error" }, { status: 400 });
    }

    const { id, title, content } = parseResult.data;
    const note = await Note.findById(id);

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Note.findByIdAndUpdate(id, {
      title,
      content,
      updatedAt: new Date(),
    });

    return Response.json({ note: await Note.findById(id) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const parseResult = deleteNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log(parseResult.error);
      return Response.json({ error: "Internal Server Error" }, { status: 400 });
    }

    const { id } = parseResult.data;
    const note = await Note.findById(id);

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    const { userId } = auth();

    if (!userId || userId !== note.userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await Note.findByIdAndDelete(id);
    return new Response(
      JSON.stringify({ message: "Note deleted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
