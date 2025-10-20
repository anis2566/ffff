import type { TRPCRouterRecord } from "@trpc/server";
import { StreamChat } from "stream-chat";

import { protectedProcedure } from "../trpc";

export const getStreamServerClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_GETSTREAM_API_KEY!,
  process.env.GETSTREAM_API_SECRET
);

export const getStreamRouter = {
  getToken: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60;

    const issuedAt = Math.floor(Date.now() / 1000) - 60;

    const token = getStreamServerClient.createToken(
      userId,
      expirationTime,
      issuedAt
    );

    return token;
  }),
} satisfies TRPCRouterRecord;
