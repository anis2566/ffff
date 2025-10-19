import type { TRPCRouterRecord } from "@trpc/server";

import { protectedProcedure, publicProcedure } from "../trpc";

export const authRouter = {
  getSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.session) return null;

    const roles = await ctx.db.role.findMany({
      where: {
        userIds: {
          has: ctx.session.user.id,
        },
      },
    });
    return {
      ...ctx.session,
      roles: roles.map((role) => role.name),
    };
  }),
  getSecretMessage: protectedProcedure.query(() => {
    return "you can see this secret message!";
  }),
} satisfies TRPCRouterRecord;
