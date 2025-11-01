import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { RoomSchema } from "@workspace/utils/schemas";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Build search filter with proper typing
const buildSearchFilter = (search?: string | null): Prisma.RoomWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

export const roomRouter = {
  createOne: permissionProcedure("room", "create")
    .input(RoomSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, capacity, availableTimes, houseId } = input;

      try {
        const [existingRoom, house] = await Promise.all([
          ctx.db.room.findFirst({
            where: {
              name,
              houseId,
            },
            select: { id: true },
          }),
          ctx.db.house.findUnique({
            where: { id: houseId },
            select: {
              roomCount: true,
              _count: {
                select: {
                  rooms: true,
                },
              },
            },
          }),
        ]);

        if (existingRoom) {
          return { success: false, message: "Room already exists" };
        }

        if (!house) {
          return { success: false, message: "House not found" };
        }

        if (house._count.rooms >= house.roomCount) {
          return { success: false, message: "House is full" };
        }

        await ctx.db.room.create({
          data: {
            name,
            capacity: Number(capacity),
            availableTimes,
            houseId,
          },
        });

        return { success: true, message: "Room created successfully" };
      } catch (error) {
        return handleError(error, "creating room");
      }
    }),

  updateOne: permissionProcedure("room", "update")
    .input(
      z.object({
        ...RoomSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, name, capacity, availableTimes, houseId } = input;

      try {
        await ctx.db.room.update({
          where: { id },
          data: {
            name,
            capacity: Number(capacity),
            availableTimes,
            houseId,
          },
        });

        return { success: true, message: "Room updated successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Room not found" };
        }
        return handleError(error, "updating room");
      }
    }),

  deleteOne: permissionProcedure("room", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.room.delete({
          where: { id: input },
        });

        return { success: true, message: "Room deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Room not found" };
        }
        return handleError(error, "deleting room");
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

      const rooms = await ctx.db.room.findMany({
        where: buildSearchFilter(query),
        select: {
          id: true,
          name: true,
          availableTimes: true,
        },
      });

      return rooms;
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const room = await ctx.db.room.findUnique({
      where: { id: input },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    return room;
  }),

  getMany: permissionProcedure("room", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search } = input;

      const where = buildSearchFilter(search);

      const [rooms, totalCount] = await Promise.all([
        ctx.db.room.findMany({
          where,
          include: {
            house: {
              select: {
                name: true,
                id: true,
              },
            },
            _count: {
              select: {
                batches: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.room.count({ where }),
      ]);

      return {
        rooms,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
