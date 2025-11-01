import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";
import {
  ADMISSION_PAYMENT_STATUS,
  currentSession,
} from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.AdmissionPaymentWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Build student search filter
const buildStudentSearchFilter = (
  search?: string | null
): Prisma.AdmissionPaymentWhereInput =>
  search
    ? { student: { name: { contains: search, mode: "insensitive" as const } } }
    : {};

// Build common admission payment filters
const buildAdmissionPaymentFilters = (
  month?: string | null,
  className?: string | null,
  id?: string | null
): Prisma.AdmissionPaymentWhereInput => ({
  ...(month && { month }),
  ...(className && { className }),
  ...(id && { student: { studentId: parseInt(id, 10) } }),
});

export const admissionPaymentRouter = {
  changeStatus: permissionProcedure("admission_payment", "receive_payment")
    .input(
      z.object({
        id: z.string(),
        paymentStatus: z.string(),
        method: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, paymentStatus, method } = input;

      try {
        const payment = await ctx.db.admissionPayment.findUnique({
          where: { id },
          select: { amount: true },
        });

        if (!payment) {
          return { success: false, message: "Payment not found" };
        }

        await ctx.db.admissionPayment.update({
          where: { id },
          data: {
            method,
            paymentStatus,
            paidAt: new Date(),
            paidAmount: payment.amount,
            updatedBy: ctx?.session?.user.name,
          },
        });

        return { success: true, message: "Payment updated successfully" };
      } catch (error) {
        return handleError(error, "updating payment");
      }
    }),

  editOne: permissionProcedure("salary_payment", "update")
    .input(
      z.object({
        id: z.string(),
        method: z.string(),
        amount: z.string(),
        paymentStatus: z.string(),
        note: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, method, amount, paymentStatus, note } = input;

      try {
        const isUnpaid = paymentStatus === ADMISSION_PAYMENT_STATUS.Unpaid;

        await ctx.db.admissionPayment.update({
          where: { id },
          data: {
            method,
            paidAmount: isUnpaid ? null : parseInt(amount, 10),
            paymentStatus,
            note: isUnpaid ? null : note,
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
        return handleError(error, "editing payment");
      }
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const payment = await ctx.db.admissionPayment.findUnique({
      where: {
        id: input,
        // paymentStatus: ADMISSION_PAYMENT_STATUS.Unpaid,
      },
      include: {
        student: {
          select: {
            studentId: true,
            name: true,
            imageUrl: true,
            className: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    return payment;
  }),

  getDueMany: permissionProcedure("admission_payment", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, month, className, id } =
        input;

      const where: Prisma.AdmissionPaymentWhereInput = {
        ...buildSessionFilter(session),
        paymentStatus: ADMISSION_PAYMENT_STATUS.Unpaid,
        ...buildStudentSearchFilter(search),
        ...buildAdmissionPaymentFilters(month, className, id),
      };

      const [payments, totalCount] = await Promise.all([
        ctx.db.admissionPayment.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                name: true,
                imageUrl: true,
                className: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.admissionPayment.count({ where }),
      ]);

      return {
        payments,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  getMany: permissionProcedure("admission_payment", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
        paymentStatus: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const {
        page,
        limit,
        sort,
        search,
        session,
        month,
        className,
        id,
        paymentStatus,
      } = input;

      const where: Prisma.AdmissionPaymentWhereInput = {
        ...buildSessionFilter(session),
        ...buildStudentSearchFilter(search),
        ...buildAdmissionPaymentFilters(month, className, id),
        ...(paymentStatus && { paymentStatus }),
      };

      const [payments, totalCount] = await Promise.all([
        ctx.db.admissionPayment.findMany({
          where,
          include: {
            student: {
              select: {
                id: true,
                studentId: true,
                name: true,
                imageUrl: true,
                className: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.admissionPayment.count({ where }),
      ]);

      return {
        payments,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
