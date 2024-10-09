import {
  createNoteSchema,
  updateNoteSchema,
  deleteNoteSchema,
} from "@/lib/validation/note";
import { auth } from "@clerk/nextjs/server";
import Note, { connectDB } from "@/lib/db/mongoose";
import { ObjectId } from "mongodb";

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const parseResult = createNoteSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { error: parseResult.error.errors },
        { status: 400 },
      );
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
    });
    return Response.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return Response.json({ error: "Failed to create note" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    console.log("Update request body:", body); // Log the request body

    const parseResult = updateNoteSchema.safeParse(body);

    if (!parseResult.success) {
      console.log("Validation error:", parseResult.error.errors); // Log validation errors
      return Response.json(
        { error: parseResult.error.errors },
        { status: 400 },
      );
    }

    const { id, title, content } = parseResult.data;
    const { userId } = auth();

    if (!userId) {
      console.log("Unauthorized: userId is null"); // Log unauthorized attempts
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updatedNote = await Note.findOneAndUpdate(
      { _id: id, userId },
      { title, content, updatedAt: new Date() },
      { new: true },
    );

    if (!updatedNote) {
      console.log(
        `Note not found or unauthorized. ID: ${id}, UserId: ${userId}`,
      ); // Log failed updates
      return Response.json(
        { error: "Note not found or unauthorized" },
        { status: 404 },
      );
    }

    console.log("Note updated successfully:", updatedNote); // Log successful updates
    return Response.json({ note: updatedNote }, { status: 200 });
  } catch (error) {
    console.error("Error updating note:", error);
    return Response.json({ error: "Failed to update note" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const parseResult = deleteNoteSchema.safeParse(body);

    if (!parseResult.success) {
      return Response.json(
        { error: parseResult.error.errors },
        { status: 400 },
      );
    }

    const { id } = parseResult.data;
    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deletedNote = await Note.findOneAndDelete({ _id: id, userId });

    if (!deletedNote) {
      return Response.json(
        { error: "Note not found or unauthorized" },
        { status: 404 },
      );
    }

    return Response.json(
      { message: "Note deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting note:", error);
    return Response.json({ error: "Failed to delete note" }, { status: 500 });
  }
}
