import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { ExamSchema } from "@workspace/utils/schemas";

export const examRouter = {
  createOne: permissionProcedure("exam", "create")
    .input(ExamSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        topic,
        subjectId,
        batchId,
        classNameId,
        examCategoryId,
        date,
        cq,
        mcq,
        written,
      } = input;

      try {
        const numberCq = cq ? parseInt(cq) : 0;
        const numberMcq = mcq ? parseInt(mcq) : 0;
        const numberWritten = written ? parseInt(written) : 0;
        const total = numberCq + numberMcq + numberWritten;

        const batch = await ctx.db.batch.findUnique({
          where: {
            id: batchId,
          },
          include: {
            students: {
              select: {
                id: true,
              },
            },
          },
        });

        if (!batch) {
          return { success: false, message: "Batch not found" };
        }

        await ctx.db.exam.create({
          data: {
            name,
            topic,
            subjectId,
            batchId,
            classNameId,
            examCategoryId,
            date: new Date(date),
            cq: numberCq,
            mcq: numberMcq,
            written: numberWritten,
            total,
          },
        });

        return { success: true, message: "Exam created" };
      } catch (error) {
        console.error("Error creating exam:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateOne: permissionProcedure("exam", "update")
    .input(
      z.object({
        data: ExamSchema,
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;

      try {
        const existingExam = await ctx.db.exam.findFirst({
          where: {
            id,
          },
        });

        if (!existingExam) {
          return { success: false, message: "Exam not found" };
        }

        const total =
          parseInt(data.cq ?? "0") +
          parseInt(data.mcq ?? "0") +
          parseInt(data.written ?? "0");

        await ctx.db.exam.update({
          where: {
            id,
          },
          data: {
            ...data,
            date: new Date(data.date),
            cq: data.cq ? parseInt(data.cq) : null,
            mcq: data.mcq ? parseInt(data.mcq) : null,
            written: data.written ? parseInt(data.written) : null,
            total,
          },
        });

        return { success: true, message: "Exam updated" };
      } catch (error) {
        console.error("Error updating exam:", error);
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

      const exams = await ctx.db.exam.findMany({
        where: {
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
      });

      return exams;
    }),
  getByBathchCategory: protectedProcedure
    .input(
      z.object({
        batchId: z.string().nullish(),
        categoryId: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { batchId, categoryId } = input;

      if (!batchId && !categoryId) {
        return [];
      }

      const exams = await ctx.db.exam.findMany({
        where: {
          ...(batchId && {
            batchId,
          }),
          ...(categoryId && {
            examCategoryId: categoryId,
          }),
        },
      });

      return exams;
    }),
  deleteOne: permissionProcedure("exam", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const existingExam = await ctx.db.exam.findFirst({
          where: {
            id,
          },
        });

        if (!existingExam) {
          return { success: false, message: "Exam not found" };
        }

        await ctx.db.exam.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "Exam deleted" };
      } catch (error) {
        console.error("Error deleting exam:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getForResult: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const examId = input;

      const examData = await ctx.db.exam.findUnique({
        where: { id: examId },
        include: {
          examResults: {
            include: {
              student: true,
            },
          },
          className: {
            select: {
              name: true,
            },
          },
          batch: {
            select: {
              name: true,
            },
          },
          subject: {
            select: {
              name: true,
            },
          },
          examCategory: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!examData) {
        throw new Error("Exam not found");
      }

      return examData;
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const examId = input;

    const examData = await ctx.db.exam.findUnique({
      where: { id: examId },
    });

    if (!examData) {
      throw new Error("Exam not found");
    }

    return examData;
  }),
  getMany: permissionProcedure("exam", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        date: z.string().nullish(),
        classNameId: z.string().nullish(),
        batchId: z.string().nullish(),
        subjectId: z.string().nullish(),
        categoryId: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const {
        page,
        limit,
        sort,
        date,
        classNameId,
        batchId,
        subjectId,
        categoryId,
      } = input;

      const [exams, totalCount] = await Promise.all([
        ctx.db.exam.findMany({
          where: {
            ...(date && {
              date: new Date(date),
            }),
            ...(classNameId && {
              classNameId,
            }),
            ...(batchId && {
              batchId,
            }),
            ...(subjectId && {
              subjectId,
            }),
            ...(categoryId && {
              examCategoryId: categoryId,
            }),
          },
          include: {
            className: {
              select: {
                name: true,
              },
            },
            batch: {
              select: {
                name: true,
              },
            },
            subject: {
              select: {
                name: true,
              },
            },
            examCategory: {
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
        ctx.db.exam.count({
          where: {
            ...(date && {
              date: new Date(date),
            }),
            ...(classNameId && {
              classNameId,
            }),
            ...(batchId && {
              batchId,
            }),
            ...(subjectId && {
              subjectId,
            }),
            ...(categoryId && {
              examCategoryId: categoryId,
            }),
          },
        }),
      ]);

      return {
        exams,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
