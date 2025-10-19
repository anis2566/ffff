import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import {
  permissionProcedure,
  protectedProcedure,
} from "../trpc";

import { UtilityPaymentSchema } from "@workspace/utils/schemas";
import { MONTH } from "@workspace/utils/constant";

export const utilityPaymentRouter = {
  createOne: permissionProcedure("utility_payment", "create")
    .input(UtilityPaymentSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, amount } = input;

      try {
        await ctx.db.utilityPayment.create({
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
  updateOne: permissionProcedure("utility_payment", "update")
    .input(
      z.object({
        ...UtilityPaymentSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, amount } = input;

      try {
        const existingPayment = await ctx.db.utilityPayment.findUnique({
          where: { id },
        });

        if (!existingPayment) {
          return { success: false, message: "Payment not found" };
        }

        await ctx.db.utilityPayment.update({
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
  deleteOne: permissionProcedure("utility_payment", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const paymentId = input;

      try {
        const existingPayment = await ctx.db.utilityPayment.findUnique({
          where: { id: paymentId },
        });

        if (!existingPayment) {
          return { success: false, message: "Payment not found" };
        }

        await ctx.db.utilityPayment.delete({
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

    const paymentData = await ctx.db.utilityPayment.findUnique({
      where: { id: paymentId },
    });

    if (!paymentData) {
      throw new Error("Payment not found");
    }

    return paymentData;
  }),
  getMany: permissionProcedure("utility_payment", "read")
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
        ctx.db.utilityPayment.findMany({
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
        ctx.db.utilityPayment.count({
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
