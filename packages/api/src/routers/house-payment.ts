import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { allPermissionsProcedure, protectedProcedure } from "../trpc";

import { HousePaymentSchema } from "@workspace/utils/schemas";
import { MONTH } from "@workspace/utils/constant";

export const housePaymentRouter = {
  createOne: allPermissionsProcedure([
    { module: "house_payment", action: "create" },
    { module: "expense", action: "create" },
  ])
    .input(HousePaymentSchema)
    .mutation(async ({ input, ctx }) => {
      const { houseId, month, amount, method, paymentStatus } = input;

      try {
        const isValidMonth = await ctx.db.housePayment.findUnique({
          where: {
            id: houseId,
            month,
          },
        });

        if (isValidMonth) {
          return {
            success: false,
            message: "House payment already exists for this month",
          };
        }

        const house = await ctx.db.house.findUnique({
          where: {
            id: houseId,
          },
        });

        if (!house) {
          return { success: false, message: "House not found" };
        }

        await ctx.db.housePayment.create({
          data: {
            session: new Date().getFullYear().toString(),
            month: Object.values(MONTH)[new Date().getMonth()] as string,
            amount: parseInt(amount),
            method,
            paymentStatus,
            houseId,
            houseName: house.name,
          },
        });

        return { success: true, message: "Payment created" };
      } catch (error) {
        console.error("Error creating payment", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const paymentId = input;

    const paymentData = await ctx.db.housePayment.findUnique({
      where: { id: paymentId },
    });

    if (!paymentData) {
      throw new Error("Payment not found");
    }

    return paymentData;
  }),
  getMany: allPermissionsProcedure([
    { module: "house_payment", action: "read" },
    { module: "expense", action: "read" },
  ])
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
        paymentStatus: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, month, paymentStatus } =
        input;

      const [payments, totalCount] = await Promise.all([
        ctx.db.housePayment.findMany({
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
            ...(paymentStatus && {
              paymentStatus,
            }),
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.housePayment.count({
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
            ...(paymentStatus && {
              paymentStatus,
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
