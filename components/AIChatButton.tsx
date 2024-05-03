"use client";
import { useState } from "react";
import AIChatBox from "@/components/AIChatBox";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";

export default function AIChatButton() {
  const [chatBorOpen, setChatBorOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setChatBorOpen(true)}>
        <Bot size={20} className="mr-2" />
        Ask AI
      </Button>
      <AIChatBox open={chatBorOpen} onClose={() => setChatBorOpen(false)} />
    </>
  );
}
