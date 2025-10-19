import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { CounterSchema } from "@workspace/utils/schemas";

export const counterRouter = {
  createOne: permissionProcedure("counter", "create")
    .input(CounterSchema)
    .mutation(async ({ input, ctx }) => {
      const { type } = input;

      try {
        await ctx.db.counter.create({
          data: {
            type,
          },
        });

        return { success: true, message: "Counter created" };
      } catch (error) {
        console.error("Error creating counter", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("counter", "update")
    .input(
      z.object({
        ...CounterSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, type, value } = input;

      try {
        const existingCounter = await ctx.db.counter.findUnique({
          where: { id },
        });

        if (!existingCounter) {
          return { success: false, message: "Counter not found" };
        }

        if (parseInt(value) !== existingCounter.value) {
          const existingValue = await ctx.db.counter.findFirst({
            where: {
              type,
              value: parseInt(value),
            },
          });

          if (existingValue) {
            return { success: false, message: "Value already exists" };
          }
        }

        await ctx.db.counter.update({
          where: { id },
          data: {
            type,
            value: parseInt(value),
          },
        });

        return { success: true, message: "Counter updated" };
      } catch (error) {
        console.error("Error updating counter", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("counter", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const counterId = input;

      try {
        const existingCounter = await ctx.db.counter.findUnique({
          where: { id: counterId },
        });

        if (!existingCounter) {
          return { success: false, message: "Counter not found" };
        }

        await ctx.db.counter.delete({
          where: { id: counterId },
        });

        return { success: true, message: "Counter deleted" };
      } catch (error) {
        console.error("Error deleting counter", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getForAdmission: protectedProcedure
    .input(
      z.object({
        classNameId: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { classNameId } = input;

      if (!classNameId) {
        return { count: null };
      }

      const className = await ctx.db.className.findUnique({
        where: {
          id: classNameId,
        },
      });

      if (!className) {
        return { count: null };
      }

      const counterData = await ctx.db.counter.findUnique({
        where: {
          type: className.name,
        },
      });

      if (!counterData) {
        return { count: null };
      }

      return {
        count: counterData.value + 1,
      };
    }),
  getForTeacher: protectedProcedure.query(async ({ ctx }) => {
    const counterData = await ctx.db.counter.findUnique({
      where: {
        type: "Teacher",
      },
    });

    console.log(counterData);

    if (!counterData) {
      return { count: null };
    }

    return {
      count: counterData.value + 1,
    };
  }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const counterId = input;

    const counterData = await ctx.db.counter.findUnique({
      where: { id: counterId },
    });

    if (!counterData) {
      throw new Error("Counter not found");
    }

    return counterData;
  }),
  getMany: permissionProcedure("counter", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        type: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, type } = input;

      const [counters, totalCount] = await Promise.all([
        ctx.db.counter.findMany({
          where: {
            ...(type && {
              type,
            }),
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.counter.count({
          where: {
            ...(type && {
              type,
            }),
          },
        }),
      ]);

      return {
        counters,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
