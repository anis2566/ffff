"use client";

import { useInitializeChatClient } from "@/hooks/use-initialize-chat-client";
import { MessageSquare } from "lucide-react";

export const Messages = () => {
  const chatClient = useInitializeChatClient();

  chatClient?.on("notification.message_new", async (event) => {
    const channels = Object.values(chatClient.activeChannels);
    const total = channels.reduce((sum, channel) => {
      return sum + (channel.countUnread() || 0);
    }, 0);
    console.log(total);
  });

  return (
    <div>
      <MessageSquare className="h-5 w-5" />
    </div>
  );
};
