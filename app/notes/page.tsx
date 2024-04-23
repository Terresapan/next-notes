import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/prisma";
import Note from "@/components/Note";

export const metadata: Metadata = {
  title: "AI Powered Notes Taking App",
};

export default async function NotesPage() {
  const { userId } = auth();

  if (!userId) throw Error("userId not found");

  const allNotes = await prisma.note.findMany({ where: { userId } });

  return (
    <div className="grid gap-3 p-24 md:grid-cols-2 lg:grid-cols-3">
      {allNotes.map((note) => (
        <Note note={note} key={note.id} />
      ))}
      {allNotes.length === 0 && (
        <p className="col-span-full p-24 text-center">
          No notes yet. You can create one by clicking the button above!
        </p>
      )}
    </div>
  );
}
