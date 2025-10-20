"use client";

import { useAuth } from "@/lib/use-auth";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export default function useInitializeChatClient() {
  const { session } = useAuth();
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);

  const trpc = useTRPC();
  const { data: token } = useQuery({
    ...trpc.getStream.getToken.queryOptions(),
    enabled: !!session?.user?.id,
  });

  useEffect(() => {
    if (!session?.user || !token) return;

    const client = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_GETSTREAM_API_KEY!
    );

    const connect = async () => {
      try {
        await client.connectUser(
          {
            id: session.user.id,
            name: session.user.name ?? "Anonymous",
            image: session.user.image ?? undefined,
          },
          token
        );
        setChatClient(client);
      } catch (error) {
        console.error("Failed to connect user:", error);
      }
    };

    connect();

    return () => {
      const disconnect = async () => {
        try {
          await client.disconnectUser();
          console.log("Stream user disconnected");
        } catch (error) {
          console.error("Failed to disconnect user:", error);
        } finally {
          setChatClient(null);
        }
      };
      disconnect();
    };
  }, [session?.user?.id, session?.user?.name, token]);

  return chatClient;
}
