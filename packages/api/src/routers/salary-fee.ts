import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { SalaryFeeSchema } from "@workspace/utils/schemas";
import { currentSession } from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.SalaryFeeWhereInput =>
  session ? { session } : { session: { in: currentSession } };

export const salaryFeeRouter = {
  createOne: permissionProcedure("salary_fee", "create")
    .input(SalaryFeeSchema)
    .mutation(async ({ input, ctx }) => {
      const { classNameId, amount, group, session } = input;

      try {
        const existingFee = await ctx.db.salaryFee.findFirst({
          where: {
            classNameId,
            session,
            ...(group && { group }),
          },
          select: { id: true },
        });

        if (existingFee) {
          return { success: false, message: "Fee already exists" };
        }

        await ctx.db.salaryFee.create({
          data: {
            session,
            classNameId,
            amount: parseInt(amount, 10),
            group,
          },
        });

        return { success: true, message: "Salary fee created successfully" };
      } catch (error) {
        return handleError(error, "creating salary fee");
      }
    }),

  updateOne: permissionProcedure("salary_fee", "update")
    .input(
      z.object({
        ...SalaryFeeSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, classNameId, amount, group, session } = input;

      try {
        await ctx.db.salaryFee.update({
          where: { id },
          data: {
            classNameId,
            amount: parseInt(amount, 10),
            group,
            session,
          },
        });

        return { success: true, message: "Salary fee updated successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Salary fee not found" };
        }
        return handleError(error, "updating salary fee");
      }
    }),

  deleteOne: permissionProcedure("salary_fee", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.salaryFee.delete({
          where: { id: input },
        });

        return { success: true, message: "Salary fee deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Salary fee not found" };
        }
        return handleError(error, "deleting salary fee");
      }
    }),

  getForAdmission: protectedProcedure
    .input(
      z.object({
        classNameId: z.string().nullish(),
        group: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { classNameId, group } = input;

      if (!classNameId) {
        return { fee: null };
      }

      const className = await ctx.db.className.findUnique({
        where: { id: classNameId },
        select: { session: true },
      });

      if (!className) {
        return { fee: null };
      }

      const salaryFee = await ctx.db.salaryFee.findFirst({
        where: {
          classNameId,
          session: className.session,
          ...(group && { group }),
        },
        select: { amount: true },
      });

      if (!salaryFee) {
        return { fee: null };
      }

      return {
        fee: salaryFee.amount,
      };
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const fee = await ctx.db.salaryFee.findUnique({
      where: { id: input },
    });

    if (!fee) {
      throw new Error("Salary fee not found");
    }

    return fee;
  }),

  getMany: permissionProcedure("salary_fee", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        className: z.string().nullish(),
        group: z.string().nullish(),
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, className, group, session } = input;

      const where: Prisma.SalaryFeeWhereInput = {
        ...buildSessionFilter(session),
        ...(className && {
          className: {
            name: className,
          },
        }),
        ...(group && { group }),
      };

      const [fees, totalCount] = await Promise.all([
        ctx.db.salaryFee.findMany({
          where,
          select: {
            id: true,
            amount: true,
            group: true,
            session: true,
            classNameId: true,
            createdAt: true,
            updatedAt: true,
            className: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.salaryFee.count({ where }),
      ]);

      return {
        fees,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
