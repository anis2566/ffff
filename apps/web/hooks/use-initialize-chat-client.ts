"use client";

import { useAuth } from "@/lib/use-auth";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

export function useInitializeChatClient() {
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

    // Prevent reconnecting if already connected
    if (client.userID) {
      setChatClient(client);
      return;
    }

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
      } catch (err) {
        console.error("Stream connect error:", err);
      }
    };

    connect();

    // ❌ Don’t disconnect on every unmount
    // Only disconnect when logging out or app truly closes
    return () => {
      // nothing
    };
  }, [session?.user?.id, token]);

  return chatClient;
}
