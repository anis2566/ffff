import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";
import {
  currentSession,
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
} from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.SalaryPaymentWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Build student search filter
const buildStudentSearchFilter = (
  search?: string | null
): Prisma.SalaryPaymentWhereInput =>
  search
    ? { student: { name: { contains: search, mode: "insensitive" as const } } }
    : {};

// Build common salary payment filters
const buildSalaryPaymentFilters = (
  className?: string | null,
  id?: string | null,
  month?: string | null
): Prisma.SalaryPaymentWhereInput => ({
  ...(className && { className }),
  ...(id && { student: { studentId: parseInt(id, 10) } }),
  ...(month && { month }),
});

export const salaryPaymentRouter = {
  updateOne: permissionProcedure("salary_payment", "receive_payment")
    .input(
      z.object({
        id: z.string(),
        method: z.string(),
        amount: z.string(),
        note: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, method, amount, note } = input;

      try {
        const existingPayment = await ctx.db.salaryPayment.findUnique({
          where: { id },
          select: {
            id: true,
            student: {
              select: {
                studentId: true,
              },
            },
          },
        });

        if (!existingPayment) {
          return {
            success: false,
            message: "Payment not found",
            transactionId: null,
            amount: null,
            status: null,
          };
        }

        const updatedPayment = await ctx.db.salaryPayment.update({
          where: { id },
          data: {
            transactionId: existingPayment.id.slice(-10).toUpperCase(),
            method,
            paidAmount: parseInt(amount, 10),
            note,
            paymentStatus: SALARY_PAYMENT_STATUS.Paid,
            paidAt: new Date(),
            updatedBy: ctx.session?.user.name,
          },
        });

        return {
          success: true,
          message: "Payment received successfully",
          transactionId: updatedPayment.transactionId || "",
          amount: updatedPayment.paidAmount || 0,
          status: updatedPayment.paymentStatus,
        };
      } catch (error) {
        console.error("Error updating payment", error);
        return {
          success: false,
          message: "Internal Server Error",
          transactionId: null,
          amount: null,
          status: null,
        };
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
        const isUnpaid = paymentStatus === SALARY_PAYMENT_STATUS.Unpaid;

        await ctx.db.salaryPayment.update({
          where: { id },
          data: {
            method,
            paidAmount: isUnpaid ? null : parseInt(amount, 10),
            paymentStatus,
            note: isUnpaid ? null : note,
            updatedBy: ctx.session?.user.name,
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

  getByStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const { studentId, page } = input;
      const limit = 5;

      const where: Prisma.SalaryPaymentWhereInput = {
        studentId,
        status: {
          notIn: [SALARY_STATUS["N/A"], SALARY_STATUS.Initiated],
        },
      };

      const [salaries, totalCount] = await Promise.all([
        ctx.db.salaryPayment.findMany({
          where,
          select: {
            id: true,
            method: true,
            amount: true,
            status: true,
            month: true,
            paymentStatus: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.salaryPayment.count({ where }),
      ]);

      return {
        salaries,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const salaryPayment = await ctx.db.salaryPayment.findUnique({
        where: { id },
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
              salaryFee: true,
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

      if (!salaryPayment) {
        throw new Error("Salary payment not found");
      }

      return salaryPayment;
    }),

  getOverview: permissionProcedure("salary_payment", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
        status: z.string().nullish(),
        paymentStatus: z.string().nullish(),
        month: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const {
        page,
        limit,
        sort,
        search,
        session,
        className,
        id,
        status,
        paymentStatus,
        month,
      } = input;

      const where: Prisma.StudentWhereInput = {
        session: session ? { equals: session } : { in: currentSession },
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
        ...(className && {
          className: {
            name: className,
          },
        }),
        ...(id && {
          studentId: parseInt(id, 10),
        }),
        ...(status && {
          salaryPayments: {
            some: { status },
          },
        }),
        ...(paymentStatus && {
          salaryPayments: {
            some: { paymentStatus },
          },
        }),
        ...(month && {
          salaryPayments: {
            some: { month },
          },
        }),
      };

      const [students, totalCount] = await Promise.all([
        ctx.db.student.findMany({
          where,
          select: {
            id: true,
            name: true,
            studentId: true,
            imageUrl: true,
            className: {
              select: {
                name: true,
              },
            },
            salaryPayments: {
              select: {
                id: true,
                status: true,
                paymentStatus: true,
                month: true,
                amount: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.student.count({ where }),
      ]);

      return {
        students,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  getDueMany: permissionProcedure("salary_payment", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
        month: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, className, id, month } =
        input;

      const where: Prisma.SalaryPaymentWhereInput = {
        ...buildSessionFilter(session),
        status: SALARY_STATUS.Present,
        paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
        ...buildStudentSearchFilter(search),
        ...buildSalaryPaymentFilters(className, id, month),
      };

      const [payments, totalCount] = await Promise.all([
        ctx.db.salaryPayment.findMany({
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
        ctx.db.salaryPayment.count({ where }),
      ]);

      return {
        payments,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  getMany: permissionProcedure("salary_payment", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
        transactionId: z.string().nullish(),
        month: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const {
        page,
        limit,
        sort,
        search,
        session,
        className,
        id,
        transactionId,
        month,
      } = input;

      const where: Prisma.SalaryPaymentWhereInput = {
        paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        ...buildSessionFilter(session),
        ...buildStudentSearchFilter(search),
        ...buildSalaryPaymentFilters(className, id, month),
        ...(transactionId && { transactionId }),
      };

      const [payments, totalCount] = await Promise.all([
        ctx.db.salaryPayment.findMany({
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
        ctx.db.salaryPayment.count({ where }),
      ]);

      return {
        payments,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
