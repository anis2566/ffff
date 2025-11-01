import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";
import { format } from "date-fns";

import { permissionProcedure, protectedProcedure } from "../trpc";
import { HomeworkSchema } from "@workspace/utils/schemas";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal server error" };
};

// Build date filter with proper typing
const buildDateFilter = (
  date?: string | null
): Prisma.HomeworkGroupWhereInput => (date ? { date: new Date(date) } : {});

// Build filter with proper typing for homework group
const buildHomeworkGroupFilter = (
  classNameId?: string | null,
  batchId?: string | null
): Prisma.HomeworkGroupWhereInput => ({
  ...(classNameId && { classNameId }),
  ...(batchId && { batchId }),
});

export const homeworkRouter = {
  createOne: permissionProcedure("homework", "create")
    .input(HomeworkSchema)
    .mutation(async ({ ctx, input }) => {
      const { date, classNameId, batchId, subjectId } = input;

      try {
        const parsedDate = new Date(date);

        // Parallel validation
        const [existingHomework, batch, subject] = await Promise.all([
          ctx.db.homeworkGroup.findFirst({
            where: {
              date: parsedDate,
              batchId,
              subjectId,
            },
            select: { id: true },
          }),
          ctx.db.batch.findUnique({
            where: { id: batchId },
            select: {
              name: true,
              students: {
                select: { id: true },
              },
            },
          }),
          ctx.db.subject.findUnique({
            where: { id: subjectId },
            select: { name: true },
          }),
        ]);

        if (existingHomework) {
          return {
            success: false,
            message: "Homework already exists for this subject or date",
          };
        }

        if (!batch) {
          return { success: false, message: "Batch not found" };
        }

        if (!batch.students.length) {
          return { success: false, message: "No students found in batch" };
        }

        if (!subject) {
          return { success: false, message: "Subject not found" };
        }

        const formattedDate = format(parsedDate, "dd-MM-yyyy");
        const name = `${batch.name}-${subject.name}-${formattedDate}`;

        await ctx.db.homeworkGroup.create({
          data: {
            name,
            date: parsedDate,
            batchId,
            subjectId,
            classNameId,
            total: batch.students.length,
            homeworks: {
              createMany: {
                data: batch.students.map((student) => ({
                  studentId: student.id,
                  date: parsedDate,
                  subjectId,
                  batchId,
                  classNameId,
                })),
              },
            },
          },
        });

        return { success: true, message: "Homework created successfully" };
      } catch (error) {
        return handleError(error, "creating homework");
      }
    }),

  updateMany: permissionProcedure("homework", "update")
    .input(
      z.object({
        ids: z.array(z.string()),
        homeworkId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { ids, homeworkId } = input;

      try {
        const homework = await ctx.db.homeworkGroup.findUnique({
          where: { id: homeworkId },
          select: { id: true, total: true },
        });

        if (!homework) {
          return { success: false, message: "Homework not found" };
        }

        const unfinished = homework.total - ids.length;

        await ctx.db.homeworkGroup.update({
          where: { id: homeworkId },
          data: {
            finished: ids.length,
            unfinished,
            homeworks: {
              updateMany: {
                where: {
                  id: { in: ids },
                },
                data: {
                  hasFinished: true,
                },
              },
            },
          },
        });

        return { success: true, message: "Homework updated successfully" };
      } catch (error) {
        return handleError(error, "updating homework");
      }
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const homework = await ctx.db.homeworkGroup.findUnique({
        where: { id: input.id },
        include: {
          className: {
            select: { name: true },
          },
          batch: {
            select: { name: true },
          },
          subject: {
            select: { name: true },
          },
          homeworks: {
            include: {
              student: {
                select: {
                  studentId: true,
                  name: true,
                  imageUrl: true,
                  mPhone: true,
                  id: true,
                },
              },
            },
          },
        },
      });

      return homework;
    }),

  deleteOne: permissionProcedure("homework", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Use delete directly - Prisma will throw if not found
        await ctx.db.homeworkGroup.delete({
          where: { id: input.id },
        });

        return { success: true, message: "Homework deleted successfully" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Homework not found" };
        }
        return handleError(error, "deleting homework");
      }
    }),

  getByStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(5),
      })
    )
    .query(async ({ ctx, input }) => {
      const { studentId, page, limit } = input;

      const where: Prisma.HomeworkWhereInput = { studentId };

      const [homeworks, totalCount] = await Promise.all([
        ctx.db.homework.findMany({
          where,
          select: {
            id: true,
            date: true,
            hasFinished: true,
            createdAt: true,
            subject: {
              select: { name: true },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.homework.count({ where }),
      ]);

      return {
        homeworks,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  getMany: permissionProcedure("homework", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        date: z.string().nullish(),
        classNameId: z.string().nullish(),
        batchId: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, date, classNameId, batchId } = input;

      const where: Prisma.HomeworkGroupWhereInput = {
        ...buildDateFilter(date),
        ...buildHomeworkGroupFilter(classNameId, batchId),
      };

      const [homeworks, totalCount] = await Promise.all([
        ctx.db.homeworkGroup.findMany({
          where,
          include: {
            className: {
              select: { name: true },
            },
            batch: {
              select: { name: true },
            },
            subject: {
              select: { name: true },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.homeworkGroup.count({ where }),
      ]);

      return {
        homeworks,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
