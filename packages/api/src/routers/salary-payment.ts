import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";
import {
  MONTH,
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
} from "@workspace/utils/constant";
import { generateTransactionIdFromObjectId } from "@workspace/utils";

export const salaryPaymentRouter = {
  updateOne: permissionProcedure("salary_payment", "update")
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
          include: {
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

        const transactionId = generateTransactionIdFromObjectId(
          existingPayment.id
        );

        const updatedPayment = await ctx.db.salaryPayment.update({
          where: { id },
          data: {
            transactionId: `${existingPayment.student.studentId}-${transactionId}`,
            method,
            amount: parseInt(amount),
            note,
            paymentStatus: SALARY_PAYMENT_STATUS.Paid,
            paidAt: new Date(),
          },
        });

        return {
          success: true,
          message: "Payment received",
          transactionId: updatedPayment.transactionId || "",
          amount: updatedPayment.amount,
          status: updatedPayment.status,
        };
      } catch (error) {
        console.error("Error updating student", error);
        return {
          success: false,
          message: "Internal Server Error",
          transactionId: null,
          amount: null,
          status: null,
        };
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

      const [salaries, totalCount] = await Promise.all([
        ctx.db.salaryPayment.findMany({
          where: {
            studentId,
            status: {
              notIn: [SALARY_STATUS["N/A"], SALARY_STATUS.Initiated],
            },
          },
          select: {
            method: true,
            amount: true,
            status: true,
            month: true,
            paymentStatus: true,
            id: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          skip: (page - 1) * 5,
        }),
        ctx.db.salaryPayment.count({
          where: {
            studentId,
            status: {
              notIn: [SALARY_STATUS["N/A"], SALARY_STATUS.Initiated],
            },
          },
        }),
      ]);

      return {
        salaries,
        totalCount,
      };
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const salaryPaymentData = await ctx.db.salaryPayment.findUnique({
        where: { id },
        select: {
          method: true,
          amount: true,
          status: true,
          month: true,
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

      if (!salaryPaymentData) {
        throw new Error("Salary Payment not found");
      }

      return salaryPaymentData;
    }),
  getOverview: permissionProcedure("salary_payment", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
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

      const [students, totalCount] = await Promise.all([
        ctx.db.student.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(id && {
              studentId: parseInt(id),
            }),
            ...(status && {
              salaryPayments: {
                some: {
                  status,
                },
              },
            }),
            ...(paymentStatus && {
              salaryPayments: {
                some: {
                  paymentStatus,
                },
              },
            }),
            ...(month && {
              salaryPayments: {
                some: {
                  month,
                },
              },
            }),
          },
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
        ctx.db.student.count({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(id && {
              studentId: parseInt(id),
            }),
            ...(status && {
              salaryPayments: {
                some: {
                  status,
                },
              },
            }),
            ...(paymentStatus && {
              salaryPayments: {
                some: {
                  paymentStatus,
                },
              },
            }),
            ...(month && {
              salaryPayments: {
                some: {
                  month,
                },
              },
            }),
          },
        }),
      ]);

      return {
        students,
        totalCount,
      };
    }),
  getDueMany: permissionProcedure("salary_payment", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
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

      const currentMothIndex = new Date().getMonth();
      const currentMonth = Object.values(MONTH)[currentMothIndex] as string;

      const [payments, totalCount] = await Promise.all([
        ctx.db.salaryPayment.findMany({
          where: {
            status: SALARY_STATUS.Present,
            paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
            month: {
              equals: month ? month : currentMonth,
            },
            ...(search && {
              student: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className,
            }),
            ...(id && {
              student: {
                studentId: parseInt(id),
              },
            }),
          },
          include: {
            student: {
              select: {
                studentId: true,
                name: true,
                imageUrl: true,
                id: true,
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
        ctx.db.salaryPayment.count({
          where: {
            status: SALARY_STATUS.Present,
            paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
            month: {
              equals: month ? month : currentMonth,
            },
            ...(search && {
              student: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className,
            }),
            ...(id && {
              student: {
                studentId: parseInt(id),
              },
            }),
          },
        }),
      ]);

      return {
        payments,
        totalCount,
      };
    }),
  getMany: permissionProcedure("salary_payment", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
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

      const [payments, totalCount] = await Promise.all([
        ctx.db.salaryPayment.findMany({
          where: {
            paymentStatus: SALARY_PAYMENT_STATUS.Paid,
            ...(search && {
              student: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className,
            }),
            ...(id && {
              student: {
                studentId: parseInt(id),
              },
            }),
            ...(transactionId && {
              transactionId,
            }),
            ...(month && {
              month,
            }),
          },
          include: {
            student: {
              select: {
                studentId: true,
                name: true,
                imageUrl: true,
                id: true,
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
        ctx.db.salaryPayment.count({
          where: {
            paymentStatus: SALARY_PAYMENT_STATUS.Paid,
            ...(search && {
              student: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className,
            }),
            ...(id && {
              student: {
                studentId: parseInt(id),
              },
            }),
            ...(transactionId && {
              transactionId,
            }),
            ...(month && {
              month,
            }),
          },
        }),
      ]);

      return {
        payments,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
