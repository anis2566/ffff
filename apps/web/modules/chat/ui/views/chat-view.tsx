"use client";

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Chat } from "stream-chat-react";

import "stream-chat-react/dist/css/v2/index.css";

import { useInitializeChatClient } from "@/hooks/use-initialize-chat-client";
import { Sidebar } from "../components/sidebar";
import { useSidebar } from "@workspace/ui/components/sidebar";
import { ChatChannel } from "../components/chat-channel";

export const ChatView = () => {
  const { open, setOpen } = useSidebar();

  const chatClient = useInitializeChatClient();
  const { resolvedTheme } = useTheme();

  if (!chatClient) {
    return (
      <div className="w-full min-h-[80vh] flex justify-center items-center">
        <Loader2 className="mx-auto my-3 animate-spin" />
      </div>
    );
  }
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-card shadow-sm">
      <div className="flex w-full h-full min-h-[80vh]">
        <Chat
          client={chatClient}
          theme={
            resolvedTheme === "dark"
              ? "str-chat__theme-dark"
              : "str-chat__theme-light"
          }
        >
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <ChatChannel open={!open} openSidebar={() => setOpen(true)} />
        </Chat>
      </div>
    </div>
  );
};
