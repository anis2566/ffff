import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";
import { EXAM_STATUS } from "@workspace/utils/constant";
import { getGrade } from "@workspace/utils";

const resultSchema = z.object({
  id: z.string(),
  cqMarks: z.number(),
  mcqMarks: z.number(),
  writtenMarks: z.number(),
});

export const examResultRouter = {
  createMany: permissionProcedure("result", "create")
    .input(
      z.object({
        examId: z.string(),
        studentIds: z.array(z.string()).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { examId, studentIds } = input;

      try {
        const exam = await ctx.db.exam.findUnique({
          where: {
            id: examId,
          },
        });

        if (!exam) {
          return { success: false, message: "Exam not found" };
        }

        const batch = await ctx.db.batch.findUnique({
          where: {
            id: exam.batchId,
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

        const total = batch.students.length;
        const attended = studentIds.length;
        const absent = total - attended;

        const hasAttended = (studentId: string) =>
          studentIds.includes(studentId);

        await ctx.db.examResultGroup.create({
          data: {
            classNameId: exam.classNameId,
            batchId: exam.batchId,
            subjectId: exam.subjectId,
            examCategoryId: exam.examCategoryId,
            examId,
            total,
            attended,
            absent,
            examResults: {
              createMany: {
                data: studentIds.map((studentId) => ({
                  studentId,
                  examId,
                  attended: hasAttended(studentId),
                  cqMarks: 0,
                  mcqMarks: 0,
                  writtenMarks: 0,
                  totalMarks: 0,
                })),
              },
            },
          },
        });

        return { success: true, message: "Result created" };
      } catch (error) {
        console.error("Error creating result:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateMany: permissionProcedure("result", "update")
    .input(
      z.object({
        resultId: z.string(),
        studentIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { resultId, studentIds } = input;

      try {
        const result = await ctx.db.examResultGroup.findUnique({
          where: {
            id: resultId,
          },
          select: {
            examResults: {
              select: {
                id: true,
              },
            },
            examId: true,
            batch: {
              select: {
                students: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });

        if (!result) {
          return { success: false, message: "Result not found" };
        }

        const total = result.batch.students.length;
        const attended = studentIds.length;
        const absent = total - attended;

        const hasAttended = (studentId: string) =>
          studentIds.includes(studentId);

        await ctx.db.$transaction(async (tx) => {
          await tx.examResultGroup.update({
            where: {
              id: resultId,
            },
            data: {
              total,
              attended,
              absent,
            },
          });

          await tx.examResult.deleteMany({
            where: {
              examResultGroupId: resultId,
            },
          });

          await tx.examResult.createMany({
            data: result.batch.students.map((student) => ({
              studentId: student.id,
              examResultGroupId: resultId,
              attended: hasAttended(student.id),
              examId: result.examId,
              cqMarks: 0,
              mcqMarks: 0,
              writtenMarks: 0,
              totalMarks: 0,
            })),
          });
        });

        return { success: true, message: "Result updated" };
      } catch (error) {
        console.error("Error updating result:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateResults: permissionProcedure("result", "update")
    .input(
      z.object({
        resultId: z.string(),
        results: z.array(resultSchema).min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { resultId, results } = input;

      try {
        const result = await ctx.db.examResultGroup.findUnique({
          where: {
            id: resultId,
          },
        });

        if (!result) {
          return { success: false, message: "Result not found" };
        }

        for (const result of results) {
          await ctx.db.examResult.update({
            where: {
              examResultGroupId: resultId,
              id: result.id,
            },
            data: {
              cqMarks: result.cqMarks,
              mcqMarks: result.mcqMarks,
              writtenMarks: result.writtenMarks,
              totalMarks:
                result.cqMarks + result.mcqMarks + result.writtenMarks,
            },
          });
        }

        return { success: true, message: "Result updated" };
      } catch (error) {
        console.error("Error updating result:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  toggleStatus: permissionProcedure("result", "update")
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const resultId = input;

      try {
        const result = await ctx.db.examResultGroup.findUnique({
          where: {
            id: resultId,
          },
          include: {
            examResults: {
              select: {
                id: true,
                status: true,
                totalMarks: true,
              },
              orderBy: {
                totalMarks: "desc",
              },
            },
            exam: {
              select: {
                total: true,
              },
            },
          },
        });

        if (!result) {
          return { success: false, message: "Result not found" };
        }

        const highestMarks = Math.max(
          ...result.examResults.map((item) => item.totalMarks ?? 0)
        );
        const lowestMarks = Math.min(
          ...result.examResults.map((item) => item.totalMarks ?? 0)
        );

        const averageMarks = Math.round(
          result.examResults.reduce((acc, item) => {
            return acc + (item.totalMarks ?? 0);
          }, 0) / result.examResults.length
        );

        await ctx.db.$transaction(async (tx) => {
          await tx.examResultGroup.update({
            where: {
              id: resultId,
            },
            data: {
              status:
                result.status === EXAM_STATUS.Published
                  ? EXAM_STATUS.Unpublished
                  : EXAM_STATUS.Published,
              highestMarks:
                result.status === EXAM_STATUS.Unpublished ? highestMarks : 0,
              lowestMarks:
                result.status === EXAM_STATUS.Unpublished ? lowestMarks : 0,
              averageMarks:
                result.status === EXAM_STATUS.Unpublished ? averageMarks : 0,
            },
          });
          for (const item of result.examResults) {
            await tx.examResult.update({
              where: {
                id: item.id,
              },
              data: {
                status:
                  item.status === EXAM_STATUS.Published
                    ? EXAM_STATUS.Unpublished
                    : EXAM_STATUS.Published,
                grade:
                  result.status === EXAM_STATUS.Unpublished
                    ? getGrade(item.totalMarks ?? 0, result.exam.total)
                    : "",
                merit:
                  result.status === EXAM_STATUS.Unpublished
                    ? result.examResults.findIndex((i) => i.id === item.id) + 1
                    : 0,
              },
            });
          }
        });

        return { success: true, message: "Result updated" };
      } catch (error) {
        console.error("Error updating result:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  deleteOne: permissionProcedure("result", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const resultId = input;

      try {
        const result = await ctx.db.examResultGroup.findUnique({
          where: {
            id: resultId,
          },
        });

        if (!result) {
          return { success: false, message: "Result not found" };
        }

        await ctx.db.examResultGroup.delete({
          where: {
            id: resultId,
          },
        });

        return { success: true, message: "Result deleted" };
      } catch (error) {
        console.error("Error deleting result:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getByStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        page: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { studentId, page } = input;

      const [results, totalCount] = await Promise.all([
        ctx.db.examResult.findMany({
          where: {
            studentId,
            status: EXAM_STATUS.Published,
          },
          include: {
            exam: {
              select: {
                name: true,
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
                date: true,
                total: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          skip: (page - 1) * 5,
        }),
        ctx.db.examResult.count({
          where: {
            studentId,
            status: EXAM_STATUS.Published,
          },
        }),
      ]);

      return {
        results,
        totalCount,
      };
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const resultId = input;

    const result = await ctx.db.examResultGroup.findUnique({
      where: {
        id: resultId,
      },
      include: {
        examResults: {
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
        exam: {
          select: {
            name: true,
            cq: true,
            mcq: true,
            written: true,
          },
        },
        className: {
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
        batch: {
          select: {
            students: {
              select: {
                id: true,
                name: true,
                studentId: true,
                imageUrl: true,
                mPhone: true,
              },
            },
            name: true,
          },
        },
      },
    });

    return result;
  }),
  getMany: permissionProcedure("result", "read")
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
      const { page, limit, sort, classNameId, batchId, subjectId, categoryId } =
        input;

      const [results, totalCount] = await Promise.all([
        ctx.db.examResultGroup.findMany({
          where: {
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
            exam: {
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
        ctx.db.examResultGroup.count({
          where: {
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
        results,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
