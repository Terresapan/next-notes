"use client";

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { useState } from "react";
import AddNoteDialog from "@/components/AddNoteDialog";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";

export default function NavBar() {
  const { theme } = useTheme();
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);

  return (
    <>
      <div
        className="w-max-7xl fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/50 px-6 py-4 drop-shadow-md backdrop-blur-md transition-colors
     dark:border-border/50 dark:bg-background/50"
      >
        <div className="mx-auto flex max-w-7xl flex-row items-center justify-between">
          <Link href={"/notes"}>
            <span className="text-md font-semibold text-accent dark:text-accent">
              Terresa
            </span>
            <span className="text-lg font-bold text-primary dark:text-primary">
              Notes
            </span>
          </Link>
          <div className="flex flex-row items-center space-x-4">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                baseTheme: theme === "dark" ? dark : undefined,
                elements: { avatarBox: { width: "2.5rem", height: "2.5rem" } },
              }}
            />
            <Button onClick={() => setShowAddNoteDialog(true)}>
              <Plus size={20} className="mr-2" />
              Add Note
            </Button>
          </div>
        </div>
      </div>
      <AddNoteDialog open={showAddNoteDialog} setOpen={setShowAddNoteDialog} />
    </>
  );
}
