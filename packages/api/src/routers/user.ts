import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

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
        where: {
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
      });

      return users;
    }),
  chngeRole: permissionProcedure("user", "update")
    .input(
      z.object({
        userId: z.string(),
        roles: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, roles } = input;

      try {
        const dbRoles = await ctx.db.role.findMany({
          where: {
            name: {
              in: roles,
            },
          },
        });

        if (dbRoles.length !== roles.length) {
          return { success: false, message: "Role not found" };
        }

        const selectedRoleIds = dbRoles.map((role) => role.id);

        await ctx.db.user.update({
          where: {
            id: userId,
          },
          data: {
            roleIds: {
              set: selectedRoleIds,
            },
          },
        });

        return {
          success: true,
          message: "User roles updated.",
        };
      } catch (error) {
        console.log("Error changing user role:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  deleteOne: permissionProcedure("user", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const existingUser = await ctx.db.user.findFirst({
          where: {
            id,
          },
        });

        if (!existingUser) {
          return { success: false, message: "User not found" };
        }

        await ctx.db.user.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "User deleted" };
      } catch (error) {
        console.log("Error deleting user:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getMany: permissionProcedure("user", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        email: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, email } = input;

      const [users, totalCount] = await Promise.all([
        ctx.db.user.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(email && {
              email: {
                contains: email,
                mode: "insensitive",
              },
            }),
          },
          include: {
            roles: {
              select: {
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
        ctx.db.user.count({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(email && {
              email: {
                contains: email,
                mode: "insensitive",
              },
            }),
          },
        }),
      ]);

      return {
        users,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
