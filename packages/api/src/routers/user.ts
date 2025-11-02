import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";
import { EngagespotClient } from "@engagespot/node";
import { StreamChat } from "stream-chat";

import { permissionProcedure, protectedProcedure } from "../trpc";

// 🧩 Lazy initialization helpers (only run at runtime)
function getEngagespot() {
  return EngagespotClient({
    apiKey: process.env.NEXT_PUBLIC_ENGAGESPOT_API_KEY!,
    apiSecret: process.env.ENGAGESPOT_API_SECRET!,
    dataRegion: "us",
  });
}

function getStreamServerClient() {
  return StreamChat.getInstance(
    process.env.NEXT_PUBLIC_GETSTREAM_API_KEY!,
    process.env.GETSTREAM_API_SECRET!
  );
}

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal server error" };
};

// Build search filter with proper typing
const buildSearchFilter = (search?: string | null): Prisma.UserWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

// Build email filter with proper typing
const buildEmailFilter = (email?: string | null): Prisma.UserWhereInput =>
  email ? { email: { contains: email, mode: "insensitive" as const } } : {};

export const userRouter = {
  forSelect: protectedProcedure
    .input(
      z.object({
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const users = await ctx.db.user.findMany({
        where: buildSearchFilter(search),
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      return users;
    }),

  changeRole: permissionProcedure("user", "update")
    .input(
      z.object({
        userId: z.string(),
        roles: z.array(z.string()).min(1, "At least one role is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, roles } = input;

      try {
        const engagespot = getEngagespot();
        const streamClient = getStreamServerClient();

        const [dbRoles, user] = await Promise.all([
          ctx.db.role.findMany({
            where: { name: { in: roles } },
            select: { id: true },
          }),
          ctx.db.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true },
          }),
        ]);

        if (dbRoles.length !== roles.length) {
          return { success: false, message: "One or more roles not found" };
        }

        if (!user) {
          return { success: false, message: "User not found" };
        }

        const selectedRoleIds = dbRoles.map((r) => ({ id: r.id }));

        await ctx.db.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: userId },
            data: {
              roles: {
                set: [],
                connect: selectedRoleIds,
              },
            },
          });

          await Promise.all([
            engagespot.createOrUpdateUser(userId, {
              email: user.email || undefined,
            }),
            streamClient.upsertUser({
              id: user.id,
              name: user.name || undefined,
              role: "user",
              username: user.name || undefined,
            }),
          ]);
        });

        return { success: true, message: "User roles updated successfully" };
      } catch (error) {
        return handleError(error, "changing user role");
      }
    }),

  deleteOne: permissionProcedure("user", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const engagespot = getEngagespot();
        const streamClient = getStreamServerClient();

        await ctx.db.$transaction(async (tx) => {
          await tx.user.delete({
            where: { id },
          });

          await Promise.all([
            engagespot.users.delete(id),
            streamClient.deleteUser(id),
          ]);
        });

        return { success: true, message: "User deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "User not found" };
        }
        return handleError(error, "deleting user");
      }
    }),

  getMany: permissionProcedure("user", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.enum(["asc", "desc"]).nullish(),
        search: z.string().nullish(),
        email: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, email } = input;

      const where: Prisma.UserWhereInput = {
        ...buildSearchFilter(search),
        ...buildEmailFilter(email),
      };

      const [users, totalCount] = await Promise.all([
        ctx.db.user.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            updatedAt: true,
            roles: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.user.count({ where }),
      ]);

      return {
        users,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
