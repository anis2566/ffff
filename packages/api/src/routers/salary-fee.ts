import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import {
  permissionProcedure,
  protectedProcedure,
} from "../trpc";

import { SalaryFeeSchema } from "@workspace/utils/schemas";

export const salaryFeeRouter = {
  createOne: permissionProcedure("salary_fee", "create")
    .input(SalaryFeeSchema)
    .mutation(async ({ input, ctx }) => {
      const { classNameId, amount, group, type } = input;

      try {
        const existingFee = await ctx.db.salaryFee.findFirst({
          where: { classNameId, type },
        });

        if (existingFee && !group) {
          return { success: false, message: "Fee already exists" };
        }

        await ctx.db.salaryFee.create({
          data: {
            type,
            classNameId,
            amount: parseInt(amount),
            group,
          },
        });

        return { success: true, message: "Salary Fee created" };
      } catch (error) {
        console.error("Error creating salary fee", error);
        return { success: false, message: "Internal Server Error" };
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
      const { id, classNameId, amount, group, type } = input;

      try {
        const existingFee = await ctx.db.salaryFee.findUnique({
          where: { id },
        });

        if (!existingFee) {
          return { success: false, message: "Salary Fee not found" };
        }

        await ctx.db.salaryFee.update({
          where: { id },
          data: {
            classNameId,
            amount: parseInt(amount),
            group,
            type,
          },
        });

        return { success: true, message: "Salary Fee updated" };
      } catch (error) {
        console.error("Error updating salary fee", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("salary_fee", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const feeId = input;

      try {
        const existingFee = await ctx.db.salaryFee.findUnique({
          where: { id: feeId },
        });

        if (!existingFee) {
          return { success: false, message: "Salary Fee not found" };
        }

        await ctx.db.salaryFee.delete({
          where: { id: feeId },
        });

        return { success: true, message: "Salary Fee deleted" };
      } catch (error) {
        console.error("Error deleting salary fee", error);
        return { success: false, message: "Internal Server Error" };
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

      const feeData = await ctx.db.salaryFee.findFirst({
        where: {
          classNameId,
          ...(group && {
            group,
          }),
        },
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

    const feeData = await ctx.db.salaryFee.findUnique({
      where: { id: feeId },
    });

    if (!feeData) {
      throw new Error("Salary Fee not found");
    }

    return feeData;
  }),
  getMany: permissionProcedure("salary_fee", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        className: z.string().nullish(),
        group: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, className, group } = input;

      const [fees, totalCount] = await Promise.all([
        ctx.db.salaryFee.findMany({
          where: {
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(group && {
              group,
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
        ctx.db.salaryFee.count({
          where: {
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(group && {
              group,
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
