import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { ClassNameSchema } from "@workspace/utils/schemas";

export const classRouter = {
  createOne: permissionProcedure("class", "create")
    .input(ClassNameSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, level, position, session } = input;

      try {
        const existingClass = await ctx.db.className.findFirst({
          where: {
            AND: [
              {
                session,
              },
              {
                OR: [
                  {
                    name,
                  },
                  {
                    position: parseInt(position),
                  },
                ],
              },
            ],
          },
        });

        if (existingClass) {
          return {
            success: false,
            message: "Class or position already exists",
          };
        }

        const newClass = await ctx.db.className.create({
          data: {
            name,
            level,
            position: parseInt(position),
            session,
          },
        });

        return {
          success: true,
          message: "Class created successfully",
          data: newClass,
        };
      } catch (error) {
        console.error("Error creating class:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateOne: permissionProcedure("class", "update")
    .input(
      z.object({
        ...ClassNameSchema.shape,
        classId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { classId, name, level, position, session } = input;

      try {
        const existingClass = await ctx.db.className.findFirst({
          where: {
            session,
            id: classId,
          },
        });

        if (!existingClass) {
          return { success: false, message: "Class not found" };
        }

        if (parseInt(position) !== existingClass.position) {
          const existingPosition = await ctx.db.className.findFirst({
            where: {
              session,
              position: parseInt(position),
            },
          });

          if (existingPosition) {
            return {
              success: false,
              message: "Position already exists",
            };
          }
        }

        await ctx.db.className.update({
          where: {
            id: classId,
          },
          data: {
            session,
            name,
            level,
            position: parseInt(position),
          },
        });

        return { success: true, message: "Class updated" };
      } catch (error) {
        console.error("Error updating class:", error);
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

      const classes = await ctx.db.className.findMany({
        where: {
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
        orderBy: {
          position: "asc",
        },
      });

      return classes;
    }),
  deleteOne: permissionProcedure("class", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const existingClass = await ctx.db.className.findFirst({
          where: {
            id,
          },
        });

        if (!existingClass) {
          return { success: false, message: "Class not found" };
        }

        await ctx.db.className.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "Class deleted" };
      } catch (error) {
        console.error("Error deleting class:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getAll: permissionProcedure("class", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        level: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, search, level } = input;

      const [classes, totalCount] = await Promise.all([
        ctx.db.className.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(level && {
              level,
            }),
          },
          include: {
            Batches: {
              select: {
                id: true,
              },
            },
            students: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.className.count({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(level && {
              level,
            }),
          },
        }),
      ]);

      return {
        classes,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
