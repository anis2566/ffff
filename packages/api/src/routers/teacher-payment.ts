import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import {
  allPermissionsProcedure,
  permissionProcedure,
  protectedProcedure,
} from "../trpc";

import { TeacherPaymentSchema } from "@workspace/utils/schemas";

export const teacherPaymentRouter = {
  createOne: permissionProcedure("teacher_payment", "create")
    .input(TeacherPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      const { teacherId, month, classUnit, incentive, deductionUnit, note } =
        input;

      try {
        const isExistingPayment = await ctx.db.teacherPayment.findFirst({
          where: {
            teacherId,
            month,
            session: new Date().getFullYear().toString(),
          },
        });

        if (isExistingPayment) {
          return {
            success: false,
            message: "Teacher already has a payment for this month",
          };
        }

        const teacher = await ctx.db.teacher.findUnique({
          where: {
            id: teacherId,
          },
        });

        if (!teacher) {
          return { success: false, message: "Teacher not found" };
        }

        const total = teacher.classRate * parseInt(classUnit);
        const deduction = deductionUnit
          ? teacher.classRate * parseInt(deductionUnit)
          : 0;

        const amount = total - deduction + (parseInt(incentive ?? "0") || 0);

        await ctx.db.teacherPayment.create({
          data: {
            teacherName: teacher.name,
            teacherIndex: teacher.teacherId,
            amount,
            netAmount: amount,
            session: new Date().getFullYear().toString(),
            classUnit: parseInt(classUnit),
            incentive: parseInt(incentive ?? "0"),
            deduction,
            deductionUnit: parseInt(deductionUnit ?? "0"),
            month,
            note,
            teacherId,
          },
        });

        return { success: true, message: "Payment created" };
      } catch (error) {
        console.error("Error creating payment", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("teacher_payment", "update")
    .input(
      z.object({
        ...TeacherPaymentSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, classUnit, incentive, deductionUnit, note } = input;

      try {
        const existingPayment = await ctx.db.teacherPayment.findUnique({
          where: { id },
        });

        if (!existingPayment) {
          return { success: false, message: "Payment not found" };
        }

        const teacher = await ctx.db.teacher.findUnique({
          where: {
            id: existingPayment.teacherId,
          },
        });

        if (!teacher) {
          return { success: false, message: "Teacher not found" };
        }

        const total = teacher.classRate * parseInt(classUnit);
        const deduction = deductionUnit
          ? teacher.classRate * parseInt(deductionUnit)
          : 0;

        const amount = total - deduction + (parseInt(incentive ?? "0") || 0);

        await ctx.db.teacherPayment.update({
          where: { id },
          data: {
            amount,
            netAmount: amount,
            classUnit: parseInt(classUnit),
            incentive: parseInt(incentive ?? "0"),
            deduction,
            deductionUnit: parseInt(deductionUnit ?? "0"),
            note,
          },
        });

        return { success: true, message: "Payment updated" };
      } catch (error) {
        console.error("Error updating payment", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  changeStatus: permissionProcedure("teacher_payment", "update")
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, status } = input;

      try {
        const existingPayment = await ctx.db.teacherPayment.findUnique({
          where: { id },
        });

        if (!existingPayment) {
          return { success: false, message: "Payment not found" };
        }

        await ctx.db.teacherPayment.update({
          where: { id },
          data: {
            status,
          },
        });

        return { success: true, message: "Status updated" };
      } catch (error) {
        console.error("Error updating advance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("teacher_payment", "delete")
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
  getByTeacher: protectedProcedure
    .input(
      z.object({
        teacherId: z.string(),
        page: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { teacherId, page } = input;

      const [payments, totalCount] = await Promise.all([
        ctx.db.teacherPayment.findMany({
          where: {
            teacherId,
          },
          include: {
            teacher: {
              select: {
                classRate: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          skip: (page - 1) * 5,
        }),
        ctx.db.teacherPayment.count({
          where: {
            teacherId,
          },
        }),
      ]);

      return {
        payments,
        totalCount,
      };
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const paymentId = input;

    const teacherPaymentData = await ctx.db.teacherPayment.findUnique({
      where: { id: paymentId },
      include: {
        teacher: {
          select: {
            classRate: true,
            name: true,
          },
        },
      },
    });

    if (!teacherPaymentData) {
      throw new Error("Payment not found");
    }

    return teacherPaymentData;
  }),
  getMany: permissionProcedure("teacher_payment", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
        id: z.string().nullish(),
        status: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, month, id, status } = input;

      const [payments, totalCount] = await Promise.all([
        ctx.db.teacherPayment.findMany({
          where: {
            ...(search && {
              teacherName: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(id && {
              teacherIndex: parseInt(id),
            }),
            ...(session && {
              session: session,
            }),
            ...(month && {
              month: month,
            }),
            ...(status && {
              status: status,
            }),
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.teacherPayment.count({
          where: {
            ...(search && {
              teacherName: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(id && {
              teacherIndex: parseInt(id),
            }),
            ...(session && {
              session: session,
            }),
            ...(month && {
              month: month,
            }),
            ...(status && {
              status: status,
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
