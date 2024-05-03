import Image from "next/image";
import logo from "../public/logo.png";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ModeToggle from "@/components/ModeToggl";
import Link from "next/link";

export default function Home() {
  const { userId } = auth();
  if (userId) {
    return redirect("/notes");
  }

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="sm: flex flex-col items-center gap-4 md:flex-row">
        <Image src={logo} alt="TN Logo" width={60} height={60} />
        <span className="name">TerresaNotes</span>
      </div>
      <p className="sm: w-5/6 max-w-prose text-center">
        An AI-Powered note-taking app, built with OpenAI, Pinecone, Next.js,
        Vercel, Shadcn UI, Clerk, MongoDB, Mongoose, and more.
      </p>
      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button size="lg" asChild>
          <Link href="/notes">Open</Link>
        </Button>
      </div>
    </main>
  );
}
