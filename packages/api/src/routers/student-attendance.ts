import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";
import { format } from "date-fns";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { AttendanceSchema } from "@workspace/utils/schemas";
import { MONTH } from "@workspace/utils/constant";

export const studentAttendanceRouter = {
  createMany: permissionProcedure("attendance_attendance", "create")
    .input(AttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      const { attendances, batchId, date } = input;

      try {
        const existingAttendances = await ctx.db.attendanceGroup.findFirst({
          where: {
            batchId: batchId,
            date: new Date(date),
          },
        });

        if (existingAttendances) {
          return { success: false, message: "Attendance already taken" };
        }

        const batch = await ctx.db.batch.findUnique({
          where: {
            id: batchId,
          },
        });

        if (!batch) {
          return { success: false, message: "Batch not found" };
        }

        const attendanceDate = new Date(date);
        const formatedDate = format(attendanceDate, "dd-MM-yyyy");
        const dayName = format(attendanceDate, "EEEE");

        const present = attendances.filter(
          (attendance) => attendance.status === "present"
        );

        const absent = attendances.filter(
          (attendance) => attendance.status === "absent"
        );

        await ctx.db.attendanceGroup.create({
          data: {
            session: new Date().getFullYear().toString(),
            month: Object.values(MONTH)[new Date().getMonth()] as string,
            date: attendanceDate,
            day: dayName, // Add this field to store the day name
            name: `${batch.name}-${formatedDate}`,
            total: attendances.length,
            present: present.length,
            absent: absent.length,
            classNameId: batch.classNameId,
            batchId,
            attendances: {
              createMany: {
                data: attendances.map((attendance) => ({
                  session: new Date().getFullYear().toString(),
                  month: Object.values(MONTH)[new Date().getMonth()] as string,
                  date: attendanceDate,
                  day: dayName,
                  status: attendance.status,
                  classNameId: batch.classNameId,
                  batchId,
                  studentId: attendance.studentId,
                })),
              },
            },
          },
        });

        return { success: true, message: "Attendance taken" };
      } catch (error) {
        console.error("Error creating attendance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  updateMany: permissionProcedure("attendance_attendance", "update")
    .input(
      z.object({
        attendances: AttendanceSchema.shape.attendances,
        attendanceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { attendances, attendanceId } = input;

      try {
        const existingAttendances = await ctx.db.attendanceGroup.findUnique({
          where: {
            id: attendanceId,
          },
        });

        if (!existingAttendances) {
          return { success: false, message: "Attendance not found" };
        }

        await ctx.db.$transaction(
          async (tx) => {
            await tx.attendance.deleteMany({
              where: {
                attendenceGroupId: attendanceId,
              },
            });

            await tx.attendance.createMany({
              data: attendances.map((attendance) => ({
                session: new Date().getFullYear().toString(),
                month: Object.values(MONTH)[new Date().getMonth()] as string,
                date: new Date(existingAttendances.date),
                day: format(new Date(existingAttendances.date), "EEEE"),
                status: attendance.status,
                classNameId: existingAttendances.classNameId,
                batchId: existingAttendances.batchId,
                studentId: attendance.studentId,
                attendenceGroupId: attendanceId,
              })),
            });
          },
          {
            maxWait: 15000,
            timeout: 10000,
          }
        );

        return { success: true, message: "Attendance updated" };
      } catch (error) {
        console.error("Error creating attendance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("attendance_attendance", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const attendanceId = input;

      try {
        const existingAttendance = await ctx.db.attendanceGroup.findUnique({
          where: { id: attendanceId },
        });

        if (!existingAttendance) {
          return { success: false, message: "Attendance not found" };
        }

        await ctx.db.attendanceGroup.delete({
          where: { id: attendanceId },
        });

        return { success: true, message: "Attendance deleted" };
      } catch (error) {
        console.error("Error creating attendance", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const attendanceId = input;

    const attendance = await ctx.db.attendanceGroup.findUnique({
      where: { id: attendanceId },
      include: {
        className: {
          select: {
            name: true,
          },
        },
        batch: {
          select: {
            name: true,
          },
        },
        attendances: {
          include: {
            student: {
              select: {
                studentId: true,
                name: true,
                imageUrl: true,
                mPhone: true,
                id: true,
              },
            },
          },
        },
      },
    });

    return attendance;
  }),
  getByStudent: protectedProcedure
    .input(
      z.object({
        studentId: z.string(),
        page: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { studentId, page } = input;

      const [attendances, totalCount] = await Promise.all([
        ctx.db.attendance.findMany({
          where: {
            studentId,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
          skip: (page - 1) * 5,
        }),
        ctx.db.attendance.count({
          where: {
            studentId,
          },
        }),
      ]);

      return {
        attendances,
        totalCount,
      };
    }),
  getMany: permissionProcedure("attendance_attendance", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        session: z.string().nullish(),
        month: z.string().nullish(),
        classNameId: z.string().nullish(),
        batchId: z.string().nullish(),
        date: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, classNameId, batchId, date, session, month } =
        input;

      const defaultSession = session
        ? session
        : new Date().getFullYear().toString();

      const [attendances, totalCount] = await Promise.all([
        ctx.db.attendanceGroup.findMany({
          where: {
            session: defaultSession,
            ...(month && {
              month: month,
            }),
            ...(classNameId && {
              classNameId: classNameId,
            }),
            ...(batchId && {
              batchId: batchId,
            }),
            ...(date && {
              date: new Date(date),
            }),
          },
          include: {
            className: {
              select: {
                name: true,
              },
            },
            batch: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.attendanceGroup.count({
          where: {
            session: defaultSession,
            ...(month && {
              month: month,
            }),
            ...(classNameId && {
              classNameId: classNameId,
            }),
            ...(batchId && {
              batchId: batchId,
            }),
            ...(date && {
              date: new Date(date),
            }),
          },
        }),
      ]);

      return {
        attendances,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
