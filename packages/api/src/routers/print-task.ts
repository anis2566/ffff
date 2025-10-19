import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure } from "../trpc";

import { PRINT_TASK_STATUS } from "@workspace/utils/constant";
import { endOfDay, startOfDay } from "date-fns";

export const printTaskRouter = {
  toggleStatus: permissionProcedure("print_task", "toggle_status")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const printTaskId = input;

      try {
        const existingPrintTask = await ctx.db.printTask.findUnique({
          where: {
            id: printTaskId,
          },
        });

        if (!existingPrintTask) {
          return { success: false, message: "Print task not found" };
        }

        await ctx.db.printTask.update({
          where: {
            id: printTaskId,
          },
          data: {
            status:
              existingPrintTask.status === PRINT_TASK_STATUS.Pending
                ? PRINT_TASK_STATUS.Printed
                : PRINT_TASK_STATUS.Pending,
          },
        });

        return { success: true, message: "Print task updated" };
      } catch (error) {
        console.error("Error updating print task:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  deleteOne: permissionProcedure("print_task", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const existingPrintTask = await ctx.db.printTask.findFirst({
          where: {
            id,
          },
        });

        if (!existingPrintTask) {
          return { success: false, message: "Print task not found" };
        }

        await ctx.db.printTask.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "Print task deleted" };
      } catch (error) {
        console.error("Error deleting print task:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getMany: permissionProcedure("print_task", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        classNameId: z.string().nullish(),
        subjectId: z.string().nullish(),
        date: z.string().nullish(),
        status: z.string().nullish(),
        type: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, classNameId, subjectId, date, type, status } =
        input;

      const startOfTheDay = startOfDay(date || new Date());
      const endOfTheDay = endOfDay(date || new Date());

      const [tasks, totalCount] = await Promise.all([
        ctx.db.printTask.findMany({
          where: {
            ...(status && {
              status,
            }),
            ...(type && {
              document: {
                type,
              },
            }),
            ...(classNameId && {
              document: {
                classNameId,
              },
            }),
            ...(subjectId && {
              document: {
                subjectId,
              },
            }),
            ...(date && {
              document: {
                deliveryDate: {
                  gte: startOfTheDay,
                  lte: endOfTheDay,
                },
              },
            }),
          },
          include: {
            document: {
              include: {
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
              },
            },
          },
          orderBy: {
            updatedAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.printTask.count({
          where: {
            ...(status && {
              status,
            }),
            ...(type && {
              document: {
                type,
              },
            }),
            ...(classNameId && {
              document: {
                classNameId,
              },
            }),
            ...(subjectId && {
              document: {
                subjectId,
              },
            }),
            ...(date && {
              document: {
                deliveryDate: new Date(date),
              },
            }),
          },
        }),
      ]);

      return {
        tasks,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
