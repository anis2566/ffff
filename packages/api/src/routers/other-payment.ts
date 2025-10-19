import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { OtherPayment } from "@workspace/utils/schemas";
import { MONTH } from "@workspace/utils/constant";

export const otherPaymentRouter = {
  createOne: permissionProcedure("income", "create")
    .input(OtherPayment)
    .mutation(async ({ input, ctx }) => {
      const { name, amount } = input;

      try {
        await ctx.db.otherPayment.create({
          data: {
            session: new Date().getFullYear().toString(),
            month: Object.values(MONTH)[new Date().getMonth()] as string,
            name,
            amount: parseInt(amount),
          },
        });

        return { success: true, message: "Payment created" };
      } catch (error) {
        console.error("Error other payment", error);
        return { success: false, message: "Internal Server Error" };
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
        const existingPayment = await ctx.db.otherPayment.findUnique({
          where: { id },
        });

        if (!existingPayment) {
          return { success: false, message: "Payment not found" };
        }

        await ctx.db.otherPayment.update({
          where: { id },
          data: {
            name,
            amount: parseInt(amount),
          },
        });

        return { success: true, message: "Payment updated" };
      } catch (error) {
        console.error("Error updating payment", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("income", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const paymentId = input;

      try {
        const existingPayment = await ctx.db.otherPayment.findUnique({
          where: { id: paymentId },
        });

        if (!existingPayment) {
          return { success: false, message: "Payment not found" };
        }

        await ctx.db.otherPayment.delete({
          where: { id: paymentId },
        });

        return { success: true, message: "Payment deleted" };
      } catch (error) {
        console.error("Error deleting other payment", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const paymentId = input;

    const paymentData = await ctx.db.otherPayment.findUnique({
      where: { id: paymentId },
    });

    if (!paymentData) {
      throw new Error("Payment not found");
    }

    return paymentData;
  }),
  getMany: permissionProcedure("income", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, month } = input;

      const [payments, totalCount] = await Promise.all([
        ctx.db.otherPayment.findMany({
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
            ...(month && {
              month,
            }),
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.otherPayment.count({
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
