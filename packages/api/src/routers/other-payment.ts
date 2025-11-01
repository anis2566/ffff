import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { OtherPayment } from "@workspace/utils/schemas";
import { currentSession, MONTH } from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.OtherPaymentWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Build search filter with proper typing
const buildSearchFilter = (
  search?: string | null
): Prisma.OtherPaymentWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

// Get current session and month
const getCurrentSession = () => new Date().getFullYear().toString();
const getCurrentMonth = () =>
  Object.values(MONTH)[new Date().getMonth()] as string;

export const otherPaymentRouter = {
  createOne: permissionProcedure("income", "create")
    .input(OtherPayment)
    .mutation(async ({ input, ctx }) => {
      const { name, amount } = input;

      try {
        await ctx.db.otherPayment.create({
          data: {
            session: getCurrentSession(),
            month: getCurrentMonth(),
            name,
            amount: parseInt(amount, 10),
            updatedBy: ctx?.session?.user.name,
          },
        });

        return { success: true, message: "Payment created successfully" };
      } catch (error) {
        return handleError(error, "creating other payment");
      }
    }),

  updateOne: permissionProcedure("income", "update")
    .input(
      z.object({
        ...OtherPayment.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, amount } = input;

      try {
        await ctx.db.otherPayment.update({
          where: { id },
          data: {
            name,
            amount: parseInt(amount, 10),
            updatedBy: ctx?.session?.user.name,
          },
        });

        return { success: true, message: "Payment updated successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Payment not found" };
        }
        return handleError(error, "updating payment");
      }
    }),

  deleteOne: permissionProcedure("income", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.otherPayment.delete({
          where: { id: input },
        });

        return { success: true, message: "Payment deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Payment not found" };
        }
        return handleError(error, "deleting other payment");
      }
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const payment = await ctx.db.otherPayment.findUnique({
      where: { id: input },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  }),

  getMany: permissionProcedure("income", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, month } = input;

      const where: Prisma.OtherPaymentWhereInput = {
        ...buildSessionFilter(session),
        ...buildSearchFilter(search),
        ...(month && { month }),
      };

      const [payments, totalCount] = await Promise.all([
        ctx.db.otherPayment.findMany({
          where,
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.otherPayment.count({ where }),
      ]);

      return {
        payments,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
