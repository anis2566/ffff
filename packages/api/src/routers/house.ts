import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { HouseSchema } from "@workspace/utils/schemas";

export const houseRouter = {
  createOne: permissionProcedure("house", "create")
    .input(HouseSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, roomCount } = input;

      try {
        const existingHouse = await ctx.db.house.findFirst({
          where: { name },
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

        return { success: true, message: "House created" };
      } catch (error) {
        console.error("Error creating house", error);
        return { success: false, message: "Internal Server Error" };
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
        const existingHouse = await ctx.db.house.findUnique({
          where: { id },
        });

        if (!existingHouse) {
          return { success: false, message: "House not found" };
        }

        await ctx.db.house.update({
          where: { id },
          data: {
            name,
            roomCount: Number(roomCount),
          },
        });

        return { success: true, message: "House updated" };
      } catch (error) {
        console.error("Error updating house", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("house", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const houseId = input;

      try {
        const existingHouse = await ctx.db.house.findUnique({
          where: { id: houseId },
        });

        if (!existingHouse) {
          return { success: false, message: "House not found" };
        }

        await ctx.db.house.delete({
          where: { id: houseId },
        });

        return { success: true, message: "House deleted" };
      } catch (error) {
        console.error("Error deleting house", error);
        return { success: false, message: "Internal Server Error" };
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

      const housess = await ctx.db.house.findMany({
        where: {
          ...(query && {
            name: {
              contains: query,
              mode: "insensitive",
            },
          }),
        },
        select: {
          id: true,
          name: true,
        },
      });

      return housess;
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const classId = input;

    const houseData = await ctx.db.house.findUnique({
      where: { id: classId },
    });

    if (!houseData) {
      throw new Error("House not found");
    }

    return houseData;
  }),
  getMany: permissionProcedure("house", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search } = input;

      const [houses, totalCount] = await Promise.all([
        ctx.db.house.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
          },
          include: {
            rooms: {
              select: {
                id: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.house.count({
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
        houses,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
