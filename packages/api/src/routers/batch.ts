import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { BatchSchema } from "@workspace/utils/schemas";
import { sortTimeSlots } from "@workspace/utils/constant";

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

export const batchRouter = {
  createOne: permissionProcedure("batch", "create")
    .input(BatchSchema)
    .mutation(async ({ input, ctx }) => {
      const { name, classNameId, capacity, classTime, time, level, roomId } =
        input;

      try {
        const existingBatch = await ctx.db.batch.findFirst({
          where: {
            name,
          },
        });

        if (existingBatch) {
          return { success: false, message: "Batch already exists" };
        }

        const className = await ctx.db.className.findUnique({
          where: { id: classNameId },
        });

        if (!className) {
          return { success: false, message: "Class not found" };
        }

        const room = await ctx.db.room.findUnique({
          where: { id: roomId },
        });

        if (!room) {
          return { success: false, message: "Room not found" };
        }

        if (parseInt(capacity) > room.capacity) {
          return {
            success: false,
            message: `Capacity exceeds room limit of ${room.capacity}`,
          };
        }

        await ctx.db.$transaction(async (tx) => {
          await tx.batch.create({
            data: {
              name,
              classNameId,
              batchClassName: className.name,
              capacity: parseInt(capacity),
              classTime,
              time: sortTimeSlots(time),
              level,
              roomId,
              roomName: room.name,
            },
          });
          await tx.room.update({
            where: {
              id: roomId,
            },
            data: {
              availableTimes: sortTimeSlots(
                room.availableTimes.filter(
                  (t) => !sortTimeSlots(time).includes(t)
                )
              ),
              bookTimes: {
                push: sortTimeSlots(time),
              },
            },
          });
        });

        return { success: true, message: "Batch created" };
      } catch (error) {
        console.error("Error creating batch", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("batch", "update")
    .input(
      z.object({
        ...BatchSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const {
        id,
        name,
        classNameId,
        capacity,
        classTime,
        time,
        level,
        roomId,
      } = input;

      try {
        const existingBatch = await ctx.db.batch.findUnique({
          where: { id },
        });

        if (!existingBatch) {
          return { success: false, message: "Batch not found" };
        }

        // Check if another batch with the same name and className exists (excluding current batch)
        const duplicateBatch = await ctx.db.batch.findFirst({
          where: {
            name,
            classNameId,
            id: { not: id },
          },
        });

        if (duplicateBatch) {
          return {
            success: false,
            message: "Batch with this name and class already exists",
          };
        }

        const newRoom = await ctx.db.room.findUnique({
          where: { id: roomId },
        });

        if (!newRoom) {
          return { success: false, message: "Room not found" };
        }

        if (parseInt(capacity) > newRoom.capacity) {
          return {
            success: false,
            message: `Capacity exceeds room limit of ${newRoom.capacity}`,
          };
        }

        const oldRoom =
          existingBatch.roomId !== roomId
            ? await ctx.db.room.findUnique({
                where: { id: existingBatch.roomId },
              })
            : null;

        await ctx.db.$transaction(async (tx) => {
          await tx.batch.update({
            where: { id },
            data: {
              name,
              classNameId,
              capacity: parseInt(capacity),
              classTime,
              time: sortTimeSlots(time),
              level,
              roomId,
              roomName: newRoom.name,
            },
          });

          if (oldRoom) {
            await tx.room.update({
              where: { id: existingBatch.roomId },
              data: {
                availableTimes: sortTimeSlots([
                  ...oldRoom.availableTimes,
                  ...existingBatch.time,
                ]),
                bookTimes: oldRoom.bookTimes.filter(
                  (t) => !existingBatch.time.includes(t)
                ),
              },
            });
          }

          const currentNewRoom =
            roomId === existingBatch.roomId ? oldRoom || newRoom : newRoom;

          let newAvailableTimes = currentNewRoom.availableTimes;
          let newBookTimes = currentNewRoom.bookTimes;

          if (roomId === existingBatch.roomId) {
            newAvailableTimes = [...newAvailableTimes, ...existingBatch.time];
            newBookTimes = newBookTimes.filter(
              (t) => !existingBatch.time.includes(t)
            );
          }

          newAvailableTimes = newAvailableTimes.filter(
            (t) => !sortTimeSlots(time).includes(t)
          );
          newBookTimes = [...newBookTimes, ...sortTimeSlots(time)];

          await tx.room.update({
            where: { id: roomId },
            data: {
              availableTimes: sortTimeSlots(newAvailableTimes),
              bookTimes: sortTimeSlots(newBookTimes),
            },
          });
        });

        return { success: true, message: "Batch updated" };
      } catch (error) {
        console.error("Error updating batch", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  removeStudent: permissionProcedure("batch", "update")
    .input(
      z.object({
        studentId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { studentId } = input;

      try {
        const student = await ctx.db.student.findUnique({
          where: { id: studentId },
        });

        if (!student) {
          return { success: false, message: "Student not found" };
        }

        await ctx.db.student.update({
          where: { id: studentId },
          data: {
            batchId: null,
          },
        });

        return { success: true, message: "Student removed from batch" };
      } catch (error) {
        console.error("Error removing student from batch", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("batch", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const batchId = input;

      try {
        const existingBatch = await ctx.db.batch.findUnique({
          where: { id: batchId },
        });

        if (!existingBatch) {
          return { success: false, message: "Batch not found" };
        }

        await ctx.db.batch.delete({
          where: { id: batchId },
        });

        return { success: true, message: "Batch deleted" };
      } catch (error) {
        console.error("Error deleting batch", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getRoomPlan: permissionProcedure("batch", "room_plan").query(
    async ({ ctx }) => {
      const classes = await ctx.db.batchClass.findMany();

      const roomPlan = classes.reduce<ACC[]>((acc, item) => {
        const existingRoom = acc.find(
          (room) => room.roomName === item.roomName
        );

        if (existingRoom) {
          const existingBatch = existingRoom.batches.find(
            (batch) => batch.batchName === item.batchName
          );

          if (existingBatch) {
            // Find a class with the same batchTime
            const existingClass = existingBatch.classes.find(
              (cls) => cls.time === item.time
            );

            if (existingClass) {
              // If subject doesn't exist, push it
              if (!existingClass.subjectName.includes(item.subjectName)) {
                existingClass.subjectName.push(item.subjectName);
                existingClass.teachers.push(item.teacherName);
              }
            } else {
              existingBatch.classes.push({
                subjectName: [item.subjectName],
                teachers: [item.teacherName],
                time: item.time, // Use batchTime for grouping
              });
            }
          } else {
            existingRoom.batches.push({
              batchName: item.batchName,
              batchTime: item.batchTime,
              batchId: item.batchId,
              classes: [
                {
                  subjectName: [item.subjectName],
                  teachers: [item.teacherName],
                  time: item.time, // Use batchTime
                },
              ],
            });
          }
        } else {
          acc.push({
            roomName: item.roomName,
            batches: [
              {
                batchName: item.batchName,
                batchTime: item.batchTime,
                batchId: item.batchId,
                classes: [
                  {
                    subjectName: [item.subjectName],
                    teachers: [item.teacherName],
                    time: item.time, // Use batchTime
                  },
                ],
              },
            ],
          });
        }

        return acc;
      }, []);

      return { roomPlan };
    }
  ),
  getByClass: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      const classId = input;

      if (!classId) {
        return [];
      }

      const batches = await ctx.db.batch.findMany({
        where: { classNameId: classId },
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
    .query(async ({ input, ctx }) => {
      const { classNameId, batchId } = input;

      if (!classNameId) {
        return [];
      }

      const batches = await ctx.db.batch.findMany({
        where: {
          ...(batchId && { id: { not: batchId } }),
          classNameId,
        },
      });

      return batches;
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const batchId = input;

    const batchData = await ctx.db.batch.findUnique({
      where: { id: batchId },
      include: {
        room: {
          select: {
            name: true,
          },
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
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        className: z.string().nullish(),
        room: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, className, room } = input;

      const [batches, totalCount] = await Promise.all([
        ctx.db.batch.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(className && {
              batchClassName: {
                equals: className,
              },
            }),
            ...(room && {
              roomId: {
                equals: room,
              },
            }),
          },
          include: {
            room: {
              select: {
                name: true,
              },
            },
            students: {
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
        ctx.db.batch.count({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(className && {
              batchClassName: {
                equals: className,
              },
            }),
            ...(room && {
              roomName: {
                equals: room,
              },
            }),
          },
        }),
      ]);

      return {
        batches,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
