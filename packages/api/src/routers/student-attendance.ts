import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
import z from "zod";
import { format } from "date-fns";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { AttendanceSchema } from "@workspace/utils/schemas";
import { MONTH, currentSession } from "@workspace/utils/constant";

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return { success: false, message: "Internal Server Error" };
};

// Reusable where clause builder for session filtering
const buildSessionFilter = (
  session?: string | null
): Prisma.AttendanceGroupWhereInput =>
  session ? { session } : { session: { in: currentSession } };

// Get current session and month
const getCurrentSession = () => new Date().getFullYear().toString();
const getCurrentMonth = () =>
  Object.values(MONTH)[new Date().getMonth()] as string;

// Calculate attendance stats
const calculateAttendanceStats = (attendances: Array<{ status: string }>) => {
  const present = attendances.filter((a) => a.status === "present").length;
  const absent = attendances.filter((a) => a.status === "absent").length;
  return { present, absent, total: attendances.length };
};

export const studentAttendanceRouter = {
  createMany: permissionProcedure("student_attendance", "create")
    .input(AttendanceSchema)
    .mutation(async ({ input, ctx }) => {
      const { attendances, batchId, date } = input;

      try {
        const attendanceDate = new Date(date);

        const [existingAttendance, batch] = await Promise.all([
          ctx.db.attendanceGroup.findFirst({
            where: {
              batchId,
              date: attendanceDate,
            },
            select: { id: true },
          }),
          ctx.db.batch.findUnique({
            where: { id: batchId },
            select: {
              name: true,
              classNameId: true,
            },
          }),
        ]);

        if (existingAttendance) {
          return { success: false, message: "Attendance already taken" };
        }

        if (!batch) {
          return { success: false, message: "Batch not found" };
        }

        const formattedDate = format(attendanceDate, "dd-MM-yyyy");
        const dayName = format(attendanceDate, "EEEE");
        const currentSession = getCurrentSession();
        const currentMonth = getCurrentMonth();
        const stats = calculateAttendanceStats(attendances);

        await ctx.db.attendanceGroup.create({
          data: {
            session: currentSession,
            month: currentMonth,
            date: attendanceDate,
            day: dayName,
            name: `${batch.name}-${formattedDate}`,
            total: stats.total,
            present: stats.present,
            absent: stats.absent,
            classNameId: batch.classNameId,
            batchId,
            attendances: {
              createMany: {
                data: attendances.map((attendance) => ({
                  session: currentSession,
                  month: currentMonth,
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

        return { success: true, message: "Attendance taken successfully" };
      } catch (error) {
        return handleError(error, "creating attendance");
      }
    }),

  updateMany: permissionProcedure("student_attendance", "update")
    .input(
      z.object({
        attendances: AttendanceSchema.shape.attendances,
        attendanceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { attendances, attendanceId } = input;

      try {
        const existingAttendance = await ctx.db.attendanceGroup.findUnique({
          where: { id: attendanceId },
          select: {
            date: true,
            classNameId: true,
            batchId: true,
          },
        });

        if (!existingAttendance) {
          return { success: false, message: "Attendance not found" };
        }

        const attendanceDate = new Date(existingAttendance.date);
        const dayName = format(attendanceDate, "EEEE");
        const currentSession = getCurrentSession();
        const currentMonth = getCurrentMonth();
        const stats = calculateAttendanceStats(attendances);

        await ctx.db.$transaction(
          async (tx) => {
            await tx.attendance.deleteMany({
              where: {
                attendenceGroupId: attendanceId,
              },
            });

            await tx.attendance.createMany({
              data: attendances.map((attendance) => ({
                session: currentSession,
                month: currentMonth,
                date: attendanceDate,
                day: dayName,
                status: attendance.status,
                classNameId: existingAttendance.classNameId,
                batchId: existingAttendance.batchId,
                studentId: attendance.studentId,
                attendenceGroupId: attendanceId,
              })),
            });

            await tx.attendanceGroup.update({
              where: { id: attendanceId },
              data: {
                total: stats.total,
                present: stats.present,
                absent: stats.absent,
              },
            });
          },
          {
            timeout: 15000,
            maxWait: 10000,
          }
        );

        return { success: true, message: "Attendance updated successfully" };
      } catch (error) {
        return handleError(error, "updating attendance");
      }
    }),

  deleteOne: permissionProcedure("student_attendance", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.attendanceGroup.delete({
          where: { id: input },
        });

        return { success: true, message: "Attendance deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Attendance not found" };
        }
        return handleError(error, "deleting attendance");
      }
    }),

  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const attendance = await ctx.db.attendanceGroup.findUnique({
      where: { id: input },
      select: {
        id: true,
        name: true,
        date: true,
        day: true,
        session: true,
        month: true,
        total: true,
        present: true,
        absent: true,
        classNameId: true,
        batchId: true,
        createdAt: true,
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
            student: true,
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
        page: z.number().min(1).default(1),
      })
    )
    .query(async ({ input, ctx }) => {
      const { studentId, page } = input;
      const limit = 5;

      const where = { studentId };

      const [attendances, totalCount] = await Promise.all([
        ctx.db.attendance.findMany({
          where,
          select: {
            id: true,
            status: true,
            date: true,
            day: true,
            month: true,
            session: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.attendance.count({ where }),
      ]);

      return {
        attendances,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  getMany: permissionProcedure("student_attendance", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
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

      const where: Prisma.AttendanceGroupWhereInput = {
        ...buildSessionFilter(session),
        ...(month && { month }),
        ...(classNameId && { classNameId }),
        ...(batchId && { batchId }),
        ...(date && { date: new Date(date) }),
      };

      const [attendances, totalCount] = await Promise.all([
        ctx.db.attendanceGroup.findMany({
          where,
          select: {
            id: true,
            name: true,
            date: true,
            day: true,
            session: true,
            month: true,
            total: true,
            present: true,
            absent: true,
            classNameId: true,
            batchId: true,
            createdAt: true,
            updatedAt: true,
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
        ctx.db.attendanceGroup.count({ where }),
      ]);

      return {
        attendances,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
