import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import {  permissionProcedure, protectedProcedure } from "../trpc";

import { RoomSchema } from "@workspace/utils/schemas";

export const roomRouter = {
  createOne: permissionProcedure("room", "create")
    .input(RoomSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, capacity, availableTimes, houseId } = input;

      try {
        const [room, house] = await Promise.all([
          ctx.db.room.findFirst({
            where: {
              name,
              houseId,
            },
          }),
          ctx.db.house.findUnique({
            where: {
              id: houseId,
            },
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

        if (room) {
          return { success: false, message: "Room already exists" };
        }

        if (!house) {
          return { success: false, message: "House not found" };
        }

        const isHouseFull = house?._count.rooms >= house?.roomCount;

        if (isHouseFull) {
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

        return { success: true, message: "Room created" };
      } catch (error) {
        console.error("Error creating room", error);
        return { success: false, message: "Internal Server Error" };
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
        const existingRoom = await ctx.db.room.findUnique({
          where: { id },
        });

        if (!existingRoom) {
          return { success: false, message: "Room not found" };
        }

        await ctx.db.room.update({
          where: { id },
          data: {
            name,
            capacity: Number(capacity),
            availableTimes,
            houseId,
          },
        });

        return { success: true, message: "Room updated" };
      } catch (error) {
        console.error("Error updating room", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("room", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const roomId = input;

      try {
        const existingRoom = await ctx.db.room.findUnique({
          where: { id: roomId },
        });

        if (!existingRoom) {
          return { success: false, message: "Room not found" };
        }

        await ctx.db.room.delete({
          where: { id: roomId },
        });

        return { success: true, message: "Room deleted" };
      } catch (error) {
        console.error("Error deleting room", error);
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

      const rooms = await ctx.db.room.findMany({
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
          availableTimes: true,
        },
      });

      return rooms;
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const roomId = input;

    const roomData = await ctx.db.room.findUnique({
      where: { id: roomId },
    });

    if (!roomData) {
      throw new Error("Room not found");
    }

    return roomData;
  }),
  getMany: permissionProcedure("room", "read")
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

      const [rooms, totalCount] = await Promise.all([
        ctx.db.room.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
          },
          include: {
            house: {
              select: {
                name: true,
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
        ctx.db.room.count({
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
        rooms,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
