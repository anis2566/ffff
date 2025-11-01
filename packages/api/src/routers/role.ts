import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { RoleSchema } from "@workspace/utils/schemas";

export const roleRouter = {
  createOne: permissionProcedure("role", "create")
    .input(RoleSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, description } = input;

      try {
        const existingRole = await ctx.db.role.findFirst({
          where: {
            name,
          },
        });

        if (existingRole) {
          return {
            success: false,
            message: "Role already exists",
          };
        }

        await ctx.db.role.create({
          data: {
            name,
            description,
          },
        });

        return { success: true, message: "Role created" };
      } catch (error) {
        console.error("Error creating role:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateOne: permissionProcedure("role", "update")
    .input(
      z.object({
        ...RoleSchema.shape,
        roleId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { roleId, name, description } = input;

      try {
        const existingRole = await ctx.db.role.findFirst({
          where: {
            id: roleId,
          },
        });

        if (!existingRole) {
          return { success: false, message: "Role not found" };
        }

        await ctx.db.role.update({
          where: {
            id: roleId,
          },
          data: {
            name,
            description,
          },
        });

        return { success: true, message: "Role updated" };
      } catch (error) {
        console.error("Error updating role:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  forSelect: protectedProcedure
    .input(
      z.object({
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const roles = await ctx.db.role.findMany({
        where: {
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return roles;
    }),
  deleteOne: permissionProcedure("role", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const existingRole = await ctx.db.role.findFirst({
          where: {
            id,
          },
        });

        if (!existingRole) {
          return { success: false, message: "Role not found" };
        }

        await ctx.db.role.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "Role deleted" };
      } catch (error) {
        console.error("Error deleting role:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getMany: permissionProcedure("role", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, search } = input;

      const [roles, totalCount] = await Promise.all([
        ctx.db.role.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
          },
          include: {
            _count: {
              select: {
                permissions: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.role.count({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
          },
        }),
      ]);

      return {
        roles,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
