import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { HouseSchema } from "@workspace/utils/schemas";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Build search filter with proper typing
const buildSearchFilter = (search?: string | null): Prisma.HouseWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

export const houseRouter = {
  createOne: permissionProcedure("house", "create")
    .input(HouseSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, roomCount } = input;

      try {
        const existingHouse = await ctx.db.house.findFirst({
          where: { name },
          select: { id: true },
        });

        if (existingHouse) {
          return { success: false, message: "House already exists" };
        }

        await ctx.db.house.create({
          data: {
            name,
            roomCount: Number(roomCount),
          },
        });

        return { success: true, message: "House created successfully" };
      } catch (error) {
        return handleError(error, "creating house");
      }
    }),

  updateOne: permissionProcedure("house", "update")
    .input(
      z.object({
        ...HouseSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, roomCount } = input;

      try {
        await ctx.db.house.update({
          where: { id },
          data: {
            name,
            roomCount: Number(roomCount),
          },
        });

        return { success: true, message: "House updated successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "House not found" };
        }
        return handleError(error, "updating house");
      }
    }),

  deleteOne: permissionProcedure("house", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.house.delete({
          where: { id: input },
        });

        return { success: true, message: "House deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "House not found" };
        }
        return handleError(error, "deleting house");
      }
    }),

  forSelect: protectedProcedure
    .input(
      z.object({
        query: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { query } = input;

      const houses = await ctx.db.house.findMany({
        where: buildSearchFilter(query),
        select: {
          id: true,
          name: true,
        },
      });

      return houses;
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const house = await ctx.db.house.findUnique({
      where: { id: input },
    });

    if (!house) {
      throw new Error("House not found");
    }

    return house;
  }),

  getMany: permissionProcedure("house", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.enum(["asc", "desc"]).nullish(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search } = input;

      const where = buildSearchFilter(search);

      const [houses, totalCount] = await Promise.all([
        ctx.db.house.findMany({
          where,
          select: {
            id: true,
            name: true,
            roomCount: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                rooms: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.house.count({ where }),
      ]);

      return {
        houses,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
