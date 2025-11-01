import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { TeacherSchema } from "@workspace/utils/schemas";
import {
  currentSession,
  splitTimeRange,
  TEACHER_STATUS,
} from "@workspace/utils/constant";

export const teacherRouter = {
  createOne: permissionProcedure("teacher", "create")
    .input(TeacherSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const existingTeacher = await ctx.db.teacher.findFirst({
          where: {
            teacherId: parseInt(input.teacherId),
          },
        });

        if (existingTeacher) {
          return { success: false, message: "Teacher already exists" };
        }

        const availableDays = input.availableDays.map((day) =>
          day.toLowerCase()
        );
        const availableTimes = input.availableTimes.map((time) =>
          time.toLowerCase()
        );

        const availableSlots = availableDays.flatMap((day) =>
          availableTimes.map((time) => `${day} ${time}`)
        );

        await ctx.db.$transaction(async (tx) => {
          await tx.teacher.create({
            data: {
              ...input,
              session: new Date().getFullYear().toString(),
              dob: new Date(input.dob),
              classRate: parseInt(input.classRate),
              teacherId: parseInt(input.teacherId),
              availableSlots,
              teacherStatus: {
                create: {
                  status: TEACHER_STATUS.Present,
                },
              },
            },
          });

          await tx.counter.update({
            where: {
              type: "Teacher",
            },
            data: {
              value: {
                increment: 1,
              },
            },
          });
        });

        return { success: true, message: "Teacher created" };
      } catch (error) {
        console.error("Error creating teacher", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateOne: permissionProcedure("teacher", "update")
    .input(
      z.object({
        ...TeacherSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;

      try {
        const existingTeacher = await ctx.db.teacher.findUnique({
          where: { id },
        });

        if (!existingTeacher) {
          return { success: false, message: "Teacher not found" };
        }

        const availableDays = input.availableDays.map((day) =>
          day.toLowerCase()
        );
        const availableTimes = input.availableTimes.map((time) =>
          time.toLowerCase()
        );

        const availableSlots = availableDays.flatMap((day) =>
          availableTimes.map((time) => `${day} ${time}`)
        );

        const updatedBookSlots = availableSlots.filter((slot) =>
          existingTeacher.bookedSlots.includes(slot)
        );

        const combinedSlots = availableSlots.map((slot) =>
          existingTeacher.bookedSlots.includes(slot) ? `${slot}` : `${slot}`
        );

        await ctx.db.teacher.update({
          where: { id },
          data: {
            ...rest,
            session: new Date().getFullYear().toString(),
            dob: new Date(input.dob),
            classRate: parseInt(input.classRate),
            teacherId: parseInt(input.teacherId),
            availableSlots: combinedSlots,
            bookedSlots: updatedBookSlots,
          },
        });

        return { success: true, message: "Teacher updated" };
      } catch (error) {
        console.error("Error updating teacher", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deactive: permissionProcedure("teacher", "update")
    .input(
      z.object({
        teacherId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { teacherId, reason } = input;

      try {
        await ctx.db.teacherStatus.update({
          where: { teacherId },
          data: { status: TEACHER_STATUS.Absent, absentReason: reason },
        });

        return { success: true, message: "Teacher deactivated" };
      } catch (error) {
        console.error("Error deactivating teacher", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  active: permissionProcedure("teacher", "update")
    .input(
      z.object({
        teacherId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { teacherId } = input;

      try {
        await ctx.db.teacherStatus.update({
          where: { teacherId },
          data: { status: TEACHER_STATUS.Present },
        });

        return { success: true, message: "Teacher activated" };
      } catch (error) {
        console.error("Error deactivating teacher", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("teacher", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const teacherId = input;

      try {
        const existingTeacher = await ctx.db.teacher.findUnique({
          where: { id: teacherId },
        });

        if (!existingTeacher) {
          return { success: false, message: "Teacher not found" };
        }

        await ctx.db.teacher.delete({
          where: { id: teacherId },
        });

        return { success: true, message: "Teacjer deleted" };
      } catch (error) {
        console.error("Error deleting teacher", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  forSelect: protectedProcedure
    .input(
      z.object({
        name: z.string().nullish(),
        id: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { name, id } = input;

      const teachers = await ctx.db.teacher.findMany({
        where: {
          session: {
            in: currentSession,
          },
          teacherStatus: {
            status: TEACHER_STATUS.Present,
          },
          ...(name && {
            name: {
              contains: name,
              mode: "insensitive",
            },
          }),
          ...(id && {
            teacherId: parseInt(id),
          }),
        },
        select: {
          name: true,
          id: true,
          teacherId: true,
          classRate: true,
        },
      });

      return {
        teachers,
      };
    }),
  getByAvailablity: protectedProcedure
    .input(
      z.object({
        days: z.array(z.string()),
        time: z.string(),
        level: z.string(),
        query: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { days, time, level, query } = input;

      const timeRange = splitTimeRange(time || "-");
      const arrayDays = typeof days === "string" ? [days] : days;

      const forDays = arrayDays?.map((day: string) => day.toLowerCase()) || [];
      const forTimes = timeRange.map((time) => time.toLowerCase());

      const slots = forDays.flatMap((day: string) =>
        forTimes.map((time) => `${day} ${time}`)
      );

      if (forDays.length === 0 || forTimes.length === 0) {
        return [];
      }

      const teachers = await ctx.db.teacher.findMany({
        where: {
          session: {
            in: currentSession,
          },
          teacherStatus: {
            status: TEACHER_STATUS.Present,
          },
          level: {
            hasSome: [level],
          },
          availableSlots: {
            hasEvery: slots,
          },
          ...(query && { name: { contains: query, mode: "insensitive" } }),
        },
        select: {
          id: true,
          name: true,
        },
        take: 3,
      });

      return teachers;
    }),
  getByBatch: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const batchId = input;

      const teachers = await ctx.db.teacher.findMany({
        where: {
          batchClasses: {
            some: {
              batchId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          teacherId: true,
          imageUrl: true,
        },
      });

      return teachers;
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const teacherId = input;

    const teacherData = await ctx.db.teacher.findUnique({
      where: { id: teacherId },
      include: {
        teacherStatus: true,
      },
    });

    if (!teacherData) {
      throw new Error("Counter not found");
    }

    return teacherData;
  }),
  getMany: permissionProcedure("teacher", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        id: z.string().nullish(),
        status: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, id, status } = input;

      const [teachers, totalCount] = await Promise.all([
        ctx.db.teacher.findMany({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(id && {
              id,
            }),
            ...(status && {
              teacherStatus: {
                status,
              },
            }),
          },
          include: {
            teacherStatus: true,
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.teacher.count({
          where: {
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(id && {
              id,
            }),
            ...(status && {
              teacherStatus: {
                status,
              },
            }),
          },
        }),
      ]);

      return {
        teachers,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
