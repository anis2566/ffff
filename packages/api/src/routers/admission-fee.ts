import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { AdmissionFeeSchema } from "@workspace/utils/schemas";

export const admissionFeeRouter = {
  createOne: permissionProcedure("admission_fee", "create")
    .input(AdmissionFeeSchema)
    .mutation(async ({ input, ctx }) => {
      const { classNameId, amount } = input;

      try {
        const existingFee = await ctx.db.admissionFee.findFirst({
          where: { classNameId },
        });

        if (existingFee) {
          return { success: false, message: "Fee already exists" };
        }

        await ctx.db.admissionFee.create({
          data: {
            classNameId,
            amount: parseInt(amount),
          },
        });

        return { success: true, message: "Admission Fee created" };
      } catch (error) {
        console.error("Error creating admission fee", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("admission_fee", "update")
    .input(
      z.object({
        ...AdmissionFeeSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, classNameId, amount } = input;

      try {
        const existingFee = await ctx.db.admissionFee.findUnique({
          where: { id },
        });

        if (!existingFee) {
          return { success: false, message: "Admission Fee not found" };
        }

        await ctx.db.admissionFee.update({
          where: { id },
          data: {
            classNameId,
            amount: parseInt(amount),
          },
        });

        return { success: true, message: "Admission Fee updated" };
      } catch (error) {
        console.error("Error updating admission fee", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("admission_fee", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const feeId = input;

      try {
        const existingFee = await ctx.db.admissionFee.findUnique({
          where: { id: feeId },
        });

        if (!existingFee) {
          return { success: false, message: "Admission Fee not found" };
        }

        await ctx.db.admissionFee.delete({
          where: { id: feeId },
        });

        return { success: true, message: "Admission Fee deleted" };
      } catch (error) {
        console.error("Error deleting admission fee", error);
        return { success: false, message: "Internal Server Error" };
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
        return { fee: null };
      }

      const feeData = await ctx.db.admissionFee.findFirst({
        where: { classNameId },
      });

      if (!feeData) {
        return { fee: null };
      }

      return {
        fee: feeData.amount,
      };
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const feeId = input;

    const feeData = await ctx.db.admissionFee.findUnique({
      where: { id: feeId },
    });

    if (!feeData) {
      throw new Error("Admission Fee not found");
    }

    return feeData;
  }),
  getMany: permissionProcedure("admission_fee", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        className: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, className } = input;

      const [fees, totalCount] = await Promise.all([
        ctx.db.admissionFee.findMany({
          where: {
            ...(className && {
              className: {
                name: className,
              },
            }),
          },
          include: {
            className: true,
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.admissionFee.count({
          where: {
            ...(className && {
              className: {
                name: className,
              },
            }),
          },
        }),
      ]);

      return {
        fees,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
