import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { BatchSchema } from "@workspace/utils/schemas";
import { currentSession, sortTimeSlots } from "@workspace/utils/constant";

type ACC = {
  roomName: string;
  batches: {
    batchName: string;
    batchTime: string;
    batchId: string;
    classes: {
      teachers: string[];
      time: string;
      subjectName: string[];
    }[];
  }[];
};

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal server error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (session?: string | null): Prisma.BatchWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Build search filter with proper typing
const buildSearchFilter = (search?: string | null): Prisma.BatchWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

// Helper function to validate room capacity
const validateRoomCapacity = async (
  db: any,
  roomId: string,
  capacity: string
) => {
  const room = await db.room.findUnique({
    where: { id: roomId },
    select: {
      capacity: true,
      name: true,
      availableTimes: true,
      bookTimes: true,
    },
  });

  if (!room) {
    return { valid: false, error: "Room not found", room: null };
  }

  if (parseInt(capacity) > room.capacity) {
    return {
      valid: false,
      error: `Capacity exceeds room limit of ${room.capacity}`,
      room: null,
    };
  }

  return { valid: true, error: null, room };
};

// Helper function to update room times
const updateRoomTimes = (
  currentTimes: string[],
  bookedTimes: string[],
  oldTimes: string[],
  newTimes: string[]
) => {
  // Remove old times from booked, add back to available
  let availableTimes = [...currentTimes, ...oldTimes];
  let bookTimes = bookedTimes.filter((t) => !oldTimes.includes(t));

  // Remove new times from available, add to booked
  availableTimes = availableTimes.filter((t) => !newTimes.includes(t));
  bookTimes = [...bookTimes, ...newTimes];

  return {
    availableTimes: sortTimeSlots(availableTimes),
    bookTimes: sortTimeSlots(bookTimes),
  };
};

export const batchRouter = {
  createOne: permissionProcedure("batch", "create")
    .input(BatchSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        session,
        name,
        classNameId,
        capacity,
        classTime,
        time,
        level,
        roomId,
      } = input;

      try {
        const sortedTime = sortTimeSlots(time);

        // Parallel fetch for validation
        const [existingBatch, className, roomValidation] = await Promise.all([
          ctx.db.batch.findFirst({
            where: { session, classNameId, name },
            select: { id: true },
          }),
          ctx.db.className.findUnique({
            where: { id: classNameId },
            select: { name: true },
          }),
          validateRoomCapacity(ctx.db, roomId, capacity),
        ]);

        if (existingBatch) {
          return { success: false, message: "Batch already exists" };
        }

        if (!className) {
          return { success: false, message: "Class not found" };
        }

        if (!roomValidation.valid) {
          return { success: false, message: roomValidation.error };
        }

        await ctx.db.$transaction(async (tx) => {
          await tx.batch.create({
            data: {
              session,
              name,
              classNameId,
              batchClassName: className.name,
              capacity: parseInt(capacity),
              classTime,
              time: sortedTime,
              level,
              roomId,
              roomName: roomValidation.room!.name,
            },
          });

          await tx.room.update({
            where: { id: roomId },
            data: {
              availableTimes: sortTimeSlots(
                roomValidation.room!.availableTimes.filter(
                  (t: string) => !sortedTime.includes(t)
                )
              ),
              bookTimes: { push: sortedTime },
            },
          });
        });

        return { success: true, message: "Batch created successfully" };
      } catch (error) {
        return handleError(error, "creating batch");
      }
    }),

  updateOne: permissionProcedure("batch", "update")
    .input(
      z.object({
        ...BatchSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        session,
        name,
        classNameId,
        capacity,
        classTime,
        time,
        level,
        roomId,
      } = input;

      try {
        const sortedTime = sortTimeSlots(time);

        // Parallel validation
        const [existingBatch, duplicateBatch, roomValidation] =
          await Promise.all([
            ctx.db.batch.findUnique({
              where: { id },
              select: { id: true, roomId: true, time: true },
            }),
            ctx.db.batch.findFirst({
              where: {
                session,
                name,
                classNameId,
                id: { not: id },
              },
              select: { id: true },
            }),
            validateRoomCapacity(ctx.db, roomId, capacity),
          ]);

        if (!existingBatch) {
          return { success: false, message: "Batch not found" };
        }

        if (duplicateBatch) {
          return {
            success: false,
            message: "Batch with this name and class already exists",
          };
        }

        if (!roomValidation.valid) {
          return { success: false, message: roomValidation.error };
        }

        const roomChanged = existingBatch.roomId !== roomId;

        // Fetch old room only if room changed
        const oldRoom = roomChanged
          ? await ctx.db.room.findUnique({
              where: { id: existingBatch.roomId },
              select: {
                id: true,
                availableTimes: true,
                bookTimes: true,
              },
            })
          : null;

        await ctx.db.$transaction(async (tx) => {
          await tx.batch.update({
            where: { id },
            data: {
              session,
              name,
              classNameId,
              capacity: parseInt(capacity),
              classTime,
              time: sortedTime,
              level,
              roomId,
              roomName: roomValidation.room!.name,
            },
          });

          // Update old room if changed
          if (oldRoom && roomChanged) {
            const oldRoomUpdates = updateRoomTimes(
              oldRoom.availableTimes,
              oldRoom.bookTimes,
              existingBatch.time,
              []
            );

            await tx.room.update({
              where: { id: existingBatch.roomId },
              data: oldRoomUpdates,
            });
          }

          // Update new room
          const currentRoom = roomChanged
            ? roomValidation.room!
            : oldRoom || roomValidation.room!;

          const newRoomUpdates = updateRoomTimes(
            currentRoom.availableTimes,
            currentRoom.bookTimes,
            roomChanged ? [] : existingBatch.time,
            sortedTime
          );

          await tx.room.update({
            where: { id: roomId },
            data: newRoomUpdates,
          });
        });

        return { success: true, message: "Batch updated successfully" };
      } catch (error) {
        return handleError(error, "updating batch");
      }
    }),

  removeStudent: permissionProcedure("batch", "update")
    .input(z.object({ studentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { studentId } = input;

      try {
        // Use update directly - Prisma will throw if not found
        await ctx.db.student.update({
          where: { id: studentId },
          data: { batchId: null },
        });

        return { success: true, message: "Student removed from batch" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Student not found" };
        }
        return handleError(error, "removing student from batch");
      }
    }),

  deleteOne: permissionProcedure("batch", "delete")
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        // Use delete directly - Prisma will throw if not found
        await ctx.db.batch.delete({
          where: { id: input },
        });

        return { success: true, message: "Batch deleted successfully" };
      } catch (error) {
        // Check if it's a record not found error
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Batch not found" };
        }
        return handleError(error, "deleting batch");
      }
    }),

  getRoomPlan: permissionProcedure("batch", "room_plan").query(
    async ({ ctx }) => {
      const classes = await ctx.db.batchClass.findMany();

      const roomPlan = classes.reduce<ACC[]>((acc, item) => {
        let room = acc.find((r) => r.roomName === item.roomName);

        if (!room) {
          room = { roomName: item.roomName, batches: [] };
          acc.push(room);
        }

        let batch = room.batches.find((b) => b.batchName === item.batchName);

        if (!batch) {
          batch = {
            batchName: item.batchName,
            batchTime: item.batchTime,
            batchId: item.batchId,
            classes: [],
          };
          room.batches.push(batch);
        }

        let cls = batch.classes.find((c) => c.time === item.time);

        if (!cls) {
          cls = {
            subjectName: [],
            teachers: [],
            time: item.time,
          };
          batch.classes.push(cls);
        }

        if (!cls.subjectName.includes(item.subjectName)) {
          cls.subjectName.push(item.subjectName);
          cls.teachers.push(item.teacherName);
        }

        return acc;
      }, []);

      return { roomPlan };
    }
  ),

  getByClass: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ ctx, input }) => {
      if (!input) return [];

      const className = await ctx.db.className.findUnique({
        where: { id: input },
        select: { session: true },
      });

      if (!className) return [];

      const batches = await ctx.db.batch.findMany({
        where: { classNameId: input, session: className.session },
        include: {
          students: {
            select: {
              name: true,
              studentId: true,
              imageUrl: true,
              mPhone: true,
              id: true,
            },
          },
        },
      });

      return batches;
    }),

  getForBatchTransfer: protectedProcedure
    .input(
      z.object({
        classNameId: z.string().nullish(),
        batchId: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { classNameId, batchId } = input;

      if (!classNameId) return [];

      const className = await ctx.db.className.findUnique({
        where: { id: classNameId },
        select: { session: true },
      });

      if (!className) return [];

      const batches = await ctx.db.batch.findMany({
        where: {
          ...(batchId && { id: { not: batchId } }),
          classNameId,
          session: className.session,
        },
      });

      return batches;
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const batchData = await ctx.db.batch.findUnique({
      where: { id: input },
      include: {
        room: {
          select: { name: true },
        },
      },
    });

    if (!batchData) {
      throw new Error("Batch not found");
    }

    return batchData;
  }),

  getMany: permissionProcedure("batch", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        room: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, sort, search, className, room, session } = input;

      const where: Prisma.BatchWhereInput = {
        ...buildSessionFilter(session),
        ...buildSearchFilter(search),
        ...(className && { batchClassName: { equals: className } }),
        ...(room && { roomId: { equals: room } }),
      };

      const [batches, totalCount] = await Promise.all([
        ctx.db.batch.findMany({
          where,
          include: {
            room: {
              select: { name: true },
            },
            _count: {
              select: { students: true },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.batch.count({ where }),
      ]);

      return {
        batches,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
