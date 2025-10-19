import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { TeacherAdvanceSchema } from "@workspace/utils/schemas";
import { MONTH, TEACHER_ADVANCE_STATUS } from "@workspace/utils/constant";

export const teacherAdvanceRouter = {
  createOne: permissionProcedure("teacher_advance", "create")
    .input(TeacherAdvanceSchema)
    .mutation(async ({ input, ctx }) => {
      const { teacherId, amount } = input;

      try {
        const teacher = await ctx.db.teacher.findUnique({
          where: {
            id: teacherId,
          },
        });

        if (!teacher) {
          return { success: false, message: "Teacher not found" };
        }

        const hasAlreadyRequested = await ctx.db.teacherAdvance.findFirst({
          where: {
            teacherId,
            status: TEACHER_ADVANCE_STATUS.Pending,
          },
        });

        if (hasAlreadyRequested) {
          return {
            success: false,
            message: "Teacher already has a pending request",
          };
        }

        await ctx.db.teacherAdvance.create({
          data: {
            session: new Date().getFullYear().toString(),
            month: Object.values(MONTH)[new Date().getMonth()] as string,
            teacherName: teacher.name,
            teacherIndex: teacher.teacherId,
            amount: parseInt(amount),
            teacherId,
          },
        });

        return { success: true, message: "Advance request successful" };
      } catch (error) {
        console.error("Error creating teacher advance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("teacher_advance", "update")
    .input(
      z.object({
        ...TeacherAdvanceSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, amount } = input;

      try {
        const existingAdvance = await ctx.db.teacherAdvance.findUnique({
          where: { id },
        });

        if (!existingAdvance) {
          return { success: false, message: "Advance not found" };
        }

        if (existingAdvance.status !== TEACHER_ADVANCE_STATUS.Pending) {
          return { success: false, message: "Unable to update advance" };
        }

        await ctx.db.teacherAdvance.update({
          where: { id },
          data: {
            amount: parseInt(amount),
          },
        });

        return { success: true, message: "Advance updated" };
      } catch (error) {
        console.error("Error updating advance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  changeStatus: permissionProcedure("teacher_advance", "update")
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, status } = input;

      try {
        const existingAdvance = await ctx.db.teacherAdvance.findUnique({
          where: { id },
        });

        if (!existingAdvance) {
          return { success: false, message: "Advance not found" };
        }

        await ctx.db.teacherAdvance.update({
          where: { id },
          data: {
            status,
          },
        });

        return { success: true, message: "Status updated" };
      } catch (error) {
        console.error("Error updating advance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("teacher_advance", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const advanceId = input;

      try {
        const existingAdvance = await ctx.db.teacherAdvance.findUnique({
          where: { id: advanceId },
        });

        if (!existingAdvance) {
          return { success: false, message: "Counter not found" };
        }

        await ctx.db.teacherAdvance.delete({
          where: { id: advanceId },
        });

        return { success: true, message: "Advance deleted" };
      } catch (error) {
        console.error("Error deleting advance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getByTeacher: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        page: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { teacherId, page } = input;

      const [advances, totalCount] = await Promise.all([
        ctx.db.teacherAdvance.findMany({
          where: {
            teacherId,
          },
          include: {
            teacher: {
              select: {
                name: true,
                teacherId: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          skip: (page - 1) * 5,
        }),
        ctx.db.teacherAdvance.count({
          where: {
            teacherId,
          },
        }),
      ]);

      return {
        advances,
        totalCount,
      };
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const advanceIt = input;

    const advanceData = await ctx.db.teacherAdvance.findUnique({
      where: { id: advanceIt },
    });

    if (!advanceData) {
      throw new Error("Advance not found");
    }

    return advanceData;
  }),
  getMany: permissionProcedure("teacher_advance", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
        status: z.string().nullish(),
        id: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, month, status, id } = input;

      const [advances, totalCount] = await Promise.all([
        ctx.db.teacherAdvance.findMany({
          where: {
            ...(search && {
              teacher: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            }),
            ...(session && {
              session: {
                equals: session,
              },
            }),
            ...(month && {
              month: {
                equals: month,
              },
            }),
            ...(status && {
              status: {
                equals: status,
              },
            }),
            ...(id && {
              teacherId: {
                equals: id,
              },
            }),
          },
          include: {
            teacher: {
              select: {
                name: true,
                teacherId: true,
                imageUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.teacherAdvance.count({
          where: {
            ...(search && {
              teacher: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            }),
            ...(session && {
              session: {
                equals: session,
              },
            }),
            ...(month && {
              month: {
                equals: month,
              },
            }),
            ...(status && {
              status: {
                equals: status,
              },
            }),
            ...(id && {
              teacherId: {
                equals: id,
              },
            }),
          },
        }),
      ]);

      return {
        advances,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
