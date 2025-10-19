import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { ExamCategory } from "@workspace/utils/schemas";

export const examCategoryRouter = {
  createOne: permissionProcedure("exam_category", "create")
    .input(ExamCategory)
    .mutation(async ({ ctx, input }) => {
      const { name } = input;

      try {
        const existingCategory = await ctx.db.examCategory.findFirst({
          where: {
            name,
          },
        });

        if (existingCategory) {
          return {
            success: false,
            message: "Category already exists",
          };
        }

        await ctx.db.examCategory.create({
          data: {
            name,
          },
        });

        return { success: true, message: "Category created" };
      } catch (error) {
        console.error("Error creating category:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  updateOne: permissionProcedure("exam_category", "update")
    .input(
      z.object({
        ...ExamCategory.shape,
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { name, categoryId } = input;

      try {
        const existingCategory = await ctx.db.examCategory.findFirst({
          where: {
            id: categoryId,
          },
        });

        if (!existingCategory) {
          return { success: false, message: "Category not found" };
        }

        await ctx.db.examCategory.update({
          where: {
            id: categoryId,
          },
          data: {
            name,
          },
        });

        return { success: true, message: "Category updated" };
      } catch (error) {
        console.error("Error updating category:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  forSelect: protectedProcedure
    .input(
      z.object({
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { search } = input;

      const categories = await ctx.db.examCategory.findMany({
        where: {
          ...(search && {
            name: {
              contains: search,
              mode: "insensitive",
            },
          }),
        },
      });

      return categories;
    }),
  deleteOne: permissionProcedure("exam_category", "delete")
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const existingCategory = await ctx.db.examCategory.findFirst({
          where: {
            id,
          },
        });

        if (!existingCategory) {
          return { success: false, message: "Category not found" };
        }

        await ctx.db.examCategory.delete({
          where: {
            id,
          },
        });

        return { success: true, message: "Category deleted" };
      } catch (error) {
        console.error("Error deleting category:", error);
        return { success: false, message: "Internal server error" };
      }
    }),
  getMany: permissionProcedure("exam_category", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, search } = input;

      const [categories, totalCount] = await Promise.all([
        ctx.db.examCategory.findMany({
          where: {
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
        ctx.db.examCategory.count({
          where: {
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
        categories,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
