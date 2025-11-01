import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { CounterSchema } from "@workspace/utils/schemas";
import { currentSession } from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.CounterWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Get current year
const getCurrentSession = () => new Date().getFullYear().toString();

export const counterRouter = {
  createOne: permissionProcedure("counter", "create")
    .input(CounterSchema)
    .mutation(async ({ input, ctx }) => {
      const { type, session } = input;

      try {
        const existingCounter = await ctx.db.counter.findFirst({
          where: {
            session,
            type,
          },
          select: { id: true },
        });

        if (existingCounter) {
          return { success: false, message: "Counter already exists" };
        }

        await ctx.db.counter.create({
          data: {
            session,
            type,
          },
        });

        return { success: true, message: "Counter created successfully" };
      } catch (error) {
        return handleError(error, "creating counter");
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
      const { id, type, value, session } = input;
      const valueInt = parseInt(value, 10);

      try {
        // Fetch existing counter and check for value conflict in parallel
        const [existingCounter, valueConflict] = await Promise.all([
          ctx.db.counter.findUnique({
            where: { id },
            select: { id: true, value: true, session: true },
          }),
          ctx.db.counter.findFirst({
            where: {
              type,
              value: valueInt,
              id: { not: id },
            },
            select: { id: true },
          }),
        ]);

        if (!existingCounter) {
          return { success: false, message: "Counter not found" };
        }

        if (existingCounter.session !== session) {
          return { success: false, message: "Counter not found" };
        }

        if (valueConflict) {
          return { success: false, message: "Value already exists" };
        }

        await ctx.db.counter.update({
          where: { id },
          data: {
            type,
            value: valueInt,
          },
        });

        return { success: true, message: "Counter updated successfully" };
      } catch (error) {
        return handleError(error, "updating counter");
      }
    }),

  deleteOne: permissionProcedure("counter", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.counter.delete({
          where: { id: input },
        });

        return { success: true, message: "Counter deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Counter not found" };
        }
        return handleError(error, "deleting counter");
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
        where: { id: classNameId },
        select: {
          name: true,
          session: true,
        },
      });

      if (!className) {
        return { count: null };
      }

      const counter = await ctx.db.counter.findUnique({
        where: {
          session: className.session,
          type: className.name,
        },
        select: {
          value: true,
        },
      });

      if (!counter) {
        return { count: null };
      }

      return {
        count: counter.value + 1,
      };
    }),

  getForTeacher: protectedProcedure.query(async ({ ctx }) => {
    const counter = await ctx.db.counter.findUnique({
      where: {
        session: getCurrentSession(),
        type: "Teacher",
      },
      select: {
        value: true,
      },
    });

    if (!counter) {
      return { count: null };
    }

    return {
      count: counter.value + 1,
    };
  }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const counter = await ctx.db.counter.findUnique({
      where: { id: input },
    });

    if (!counter) {
      throw new Error("Counter not found");
    }

    return counter;
  }),

  getMany: permissionProcedure("counter", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, session } = input;

      const where: Prisma.CounterWhereInput = {
        ...buildSessionFilter(session),
      };

      const [counters, totalCount] = await Promise.all([
        ctx.db.counter.findMany({
          where,
          select: {
            id: true,
            type: true,
            value: true,
            session: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.counter.count({ where }),
      ]);

      return {
        counters,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
