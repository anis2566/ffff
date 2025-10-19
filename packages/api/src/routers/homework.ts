import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { HomeworkSchema } from "../../../utils/src/schemas";
import { format } from "date-fns";

export const homeworkRouter = {
  createOne: permissionProcedure("homework", "create")
    .input(HomeworkSchema)
    .mutation(async ({ ctx, input }) => {
      const { date, classNameId, batchId, subjectId } = input;

      try {
        const existingHomework = await ctx.db.homeworkGroup.findFirst({
          where: {
            date: new Date(date),
            batchId,
            subjectId,
          },
        });

        if (existingHomework) {
          return {
            success: false,
            message: "Homework already exists for this subject or date",
          };
        }

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

        if (!batch.students.length) {
          return { success: false, message: "No students found in batch" };
        }

        const subject = await ctx.db.subject.findUnique({
          where: {
            id: subjectId,
          },
        });

        if (!subject) {
          return { success: false, message: "Subject not found" };
        }

        const formatedDate = format(date, "dd-MM-yyyy");
        const name = `${batch.name}-${subject.name}-${formatedDate}`;

        await ctx.db.homeworkGroup.create({
          data: {
            name,
            date: new Date(date),
            batchId,
            subjectId,
            classNameId,
            total: batch.students.length,
            homeworks: {
              createMany: {
                data: batch.students.map((student) => ({
                  studentId: student.id,
                  date: new Date(date),
                  subjectId,
                  batchId,
                  classNameId,
                })),
              },
            },
          },
        });

        return { success: true, message: "Homework created" };
      } catch (error) {
        console.error("Error creating homework:", error);
        return { success: false, message: "Internal server error" };
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
          where: {
            id: homeworkId,
          },
        });

        if (!homework) {
          return { success: false, message: "Homework not found" };
        }

        const unfinished = homework.total - ids.length;

        await ctx.db.homeworkGroup.update({
          where: {
            id: homeworkId,
          },
          data: {
            finished: ids.length,
            unfinished,
            homeworks: {
              updateMany: {
                where: {
                  id: {
                    in: ids,
                  },
                },
                data: {
                  hasFinished: true,
                },
              },
            },
          },
        });

        return { success: true, message: "Homework updated" };
      } catch (error) {
        console.error("Error updating homework:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const homework = await ctx.db.homeworkGroup.findUnique({
        where: {
          id,
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
      const { id } = input;

      try {
        const existingHomework = await ctx.db.homeworkGroup.findFirst({
          where: {
            id,
          },
        });

        if (!existingHomework) {
          return { success: false, message: "Homework not found" };
        }

        await ctx.db.homeworkGroup.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "Homework deleted" };
      } catch (error) {
        console.error("Error deleting homework:", error);
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

      const [homeworks, totalCount] = await Promise.all([
        ctx.db.homework.findMany({
          where: {
            studentId,
          },
          include: {
            subject: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          skip: (page - 1) * 5,
        }),
        ctx.db.homework.count({
          where: {
            studentId,
          },
        }),
      ]);

      return {
        homeworks,
        totalCount,
      };
    }),
  getMany: permissionProcedure("homework", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        date: z.string().nullish(),
        classNameId: z.string().nullish(),
        batchId: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, date, classNameId, batchId } = input;

      const [homeworks, totalCount] = await Promise.all([
        ctx.db.homeworkGroup.findMany({
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
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.homeworkGroup.count({
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
          },
        }),
      ]);

      return {
        homeworks,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
