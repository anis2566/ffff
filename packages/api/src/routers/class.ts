import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { ClassNameSchema } from "@workspace/utils/schemas";
import { sendNotificationToUser } from "@workspace/notifications/notification-service";

export const classRouter = {
  createOne: permissionProcedure("class", "create")
    .input(ClassNameSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, level, position } = input;

      try {
        const existingClass = await ctx.db.className.findFirst({
          where: {
            OR: [
              {
                name,
              },
              {
                position: parseInt(position),
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

        // await ctx.db.className.create({
        //   data: {
        //     name,
        //     level,
        //     position: parseInt(position),
        //   },
        // });

        const accountUser = await ctx.db.user.findFirst({
          where: {
            roles: {
              some: {
                name: "Accountant",
              },
            },
          },
          include: {
            fcmTokens: true,
          },
        });

        if (!accountUser || accountUser.fcmTokens.length === 0) {
          return { success: false, message: "Accountant not found" };
        }

        await sendNotificationToUser(accountUser.id, {
          title: "New Class",
          body: `New class created: ${name}`,
          imageUrl: "https://cp3c2zrvx5.ufs.sh/f/ayZgjKIJUTePzHzvWDQJLzjR4Iu8hPiYMQC3Oxadv5tEbe2G",
        });

        return { success: false, message: "Class created" };
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
      const { classId, name, level, position } = input;

      try {
        const existingClass = await ctx.db.className.findFirst({
          where: {
            id: classId,
          },
        });

        if (!existingClass) {
          return { success: false, message: "Class not found" };
        }

        if (parseInt(position) !== existingClass.position) {
          const existingPosition = await ctx.db.className.findFirst({
            where: {
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
