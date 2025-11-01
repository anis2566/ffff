import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { AdmissionFeeSchema } from "@workspace/utils/schemas";
import { currentSession } from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.AdmissionFeeWhereInput =>
  session ? { session } : { session: { in: currentSession } };

export const admissionFeeRouter = {
  createOne: permissionProcedure("admission_fee", "create")
    .input(AdmissionFeeSchema)
    .mutation(async ({ input, ctx }) => {
      const { classNameId, amount, session } = input;

      try {
        const existingFee = await ctx.db.admissionFee.findFirst({
          where: { classNameId, session },
          select: { id: true },
        });

        if (existingFee) {
          return { success: false, message: "Fee already exists" };
        }

        await ctx.db.admissionFee.create({
          data: {
            session,
            classNameId,
            amount: parseInt(amount, 10),
          },
        });

        return { success: true, message: "Admission fee created successfully" };
      } catch (error) {
        return handleError(error, "creating admission fee");
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
      const { id, classNameId, amount, session } = input;

      try {
        const existingFee = await ctx.db.admissionFee.findUnique({
          where: { id },
          select: { id: true, session: true },
        });

        if (!existingFee) {
          return { success: false, message: "Admission fee not found" };
        }

        if (existingFee.session !== session) {
          return { success: false, message: "Admission fee not found" };
        }

        await ctx.db.admissionFee.update({
          where: { id },
          data: {
            session,
            classNameId,
            amount: parseInt(amount, 10),
          },
        });

        return { success: true, message: "Admission fee updated successfully" };
      } catch (error) {
        return handleError(error, "updating admission fee");
      }
    }),

  deleteOne: permissionProcedure("admission_fee", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.admissionFee.delete({
          where: { id: input },
        });

        return { success: true, message: "Admission fee deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Admission fee not found" };
        }
        return handleError(error, "deleting admission fee");
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

      const className = await ctx.db.className.findUnique({
        where: { id: classNameId },
        select: { session: true },
      });

      if (!className) {
        return { fee: null };
      }

      const admissionFee = await ctx.db.admissionFee.findFirst({
        where: {
          classNameId,
          session: className.session,
        },
        select: { amount: true },
      });

      if (!admissionFee) {
        return { fee: null };
      }

      return {
        fee: admissionFee.amount,
      };
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const fee = await ctx.db.admissionFee.findUnique({
      where: { id: input },
    });

    if (!fee) {
      throw new Error("Admission fee not found");
    }

    return fee;
  }),

  getMany: permissionProcedure("admission_fee", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        className: z.string().nullish(),
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, className, session } = input;

      const where: Prisma.AdmissionFeeWhereInput = {
        ...buildSessionFilter(session),
        ...(className && {
          className: {
            name: className,
          },
        }),
      };

      const [fees, totalCount] = await Promise.all([
        ctx.db.admissionFee.findMany({
          where,
          select: {
            id: true,
            amount: true,
            session: true,
            classNameId: true,
            createdAt: true,
            updatedAt: true,
            className: {
              select: {
                id: true,
                name: true,
                level: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.admissionFee.count({ where }),
      ]);

      return {
        fees,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
