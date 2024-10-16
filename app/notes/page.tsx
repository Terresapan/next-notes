import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import Note from "@/lib/db/mongoose";
import Notes from "@/components/Note";
import AIChatButton from "@/components/AIChatButton";

export const metadata: Metadata = {
  title: "AI Powered Notes",
};

export default async function NotesPage() {
  const { userId } = auth();
  if (!userId) throw Error("userId not found");
  const allNotes = await Note.find({ userId: userId });

  return (
    <>
      <div className="grid gap-3 p-24 md:grid-cols-2 lg:grid-cols-3">
        {allNotes.map((note) => (
          <Notes note={note} key={note.id} />
        ))}
        {allNotes.length === 0 && (
          <p className="col-span-full p-24 text-center">
            No notes yet. You can create one by clicking the button above!
          </p>
        )}
      </div>
      <div className="fixed bottom-4 right-4 p-3">
        <AIChatButton />
      </div>
    </>
  );
}
