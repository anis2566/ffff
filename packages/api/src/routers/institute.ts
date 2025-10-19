import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { InstituteSchema } from "@workspace/utils/schemas";

export const instituteRouter = {
  createOne: permissionProcedure("institute", "create")
    .input(InstituteSchema)
    .mutation(async ({ input, ctx }) => {
      const { type, name } = input;

      try {
        const existingCounter = await ctx.db.institute.findFirst({
          where: {
            type,
            name,
          },
        });

        if (existingCounter) {
          return { success: false, message: "Institute already exists" };
        }

        await ctx.db.institute.create({
          data: {
            type,
            name,
          },
        });

        return { success: true, message: "Institute created" };
      } catch (error) {
        console.error("Error creating institute", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("institute", "update")
    .input(
      z.object({
        ...InstituteSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, type, name } = input;

      try {
        const existingInstitute = await ctx.db.institute.findUnique({
          where: { id },
        });

        if (!existingInstitute) {
          return { success: false, message: "Institute not found" };
        }

        await ctx.db.institute.update({
          where: { id },
          data: {
            type,
            name,
          },
        });

        return { success: true, message: "Institute updated" };
      } catch (error) {
        console.error("Error updating institute", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("institute", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const instituteId = input;

      try {
        const existingInstitute = await ctx.db.institute.findUnique({
          where: { id: instituteId },
        });

        if (!existingInstitute) {
          return { success: false, message: "Institute not found" };
        }

        await ctx.db.institute.delete({
          where: { id: instituteId },
        });

        return { success: true, message: "Institute deleted" };
      } catch (error) {
        console.error("Error deleting institute", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const instituteId = input;

    const instituteData = await ctx.db.institute.findUnique({
      where: { id: instituteId },
    });

    if (!instituteData) {
      throw new Error("Institute not found");
    }

    return instituteData;
  }),
  getMany: permissionProcedure("institute", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        type: z.string().nullish(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, type, search } = input;

      const [institutes, totalCount] = await Promise.all([
        ctx.db.institute.findMany({
          where: {
            ...(type && {
              type,
            }),
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.institute.count({
          where: {
            ...(type && {
              type,
            }),
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
          },
        }),
      ]);

      return {
        institutes,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
