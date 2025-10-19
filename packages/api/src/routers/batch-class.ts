import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { BatchClassSchema } from "@workspace/utils/schemas";
import { formatTime, splitTimeRange } from "@workspace/utils/constant";

type ClassData = {
  time: string;
  day: string;
  teacherName: string;
  subjectName: string;
  roomName: string;
  id: string;
  teacherId: string;
};
 
type GroupedData = {
  day: string;
  time: string;
  classes: {
    time: string;
    teacherName: string;
    subjectName: string;
    roomName: string;
    id: string;
    teacherId: string;
    className: string;
  }[];
};

export const batchClassRouter = {
  createMany: permissionProcedure("batch_class", "create")
    .input(BatchClassSchema)
    .mutation(async ({ input, ctx }) => {
      const { time, days, batchId, teacherId, subjectId } = input;

      try {
        const batch = await ctx.db.batch.findUnique({
          where: {
            id: batchId,
          },
          include: {
            room: {
              select: {
                name: true,
                id: true,
              },
            },
          },
        });

        if (!batch) {
          return { success: false, message: "Batch not found" };
        }

        const teacher = await ctx.db.teacher.findUnique({
          where: {
            id: teacherId,
          },
        });

        if (!teacher) {
          return { success: false, message: "Teacher not found" };
        }

        const subject = await ctx.db.subject.findUnique({
          where: {
            id: subjectId,
          },
        });

        if (!subject) {
          return { success: false, message: "Subject not found" };
        }

        const timeRange = splitTimeRange(time || "-");
        const forDays = days.map((item: string) => item.toLowerCase()) || [];
        const forTimes = timeRange.map((time) => time.toLowerCase());

        const slots = forDays.flatMap((day: string) =>
          forTimes.map((time) => `${day} ${time}`)
        );

        for (const day of days) {
          await ctx.db.$transaction(async (tx) => {
            await tx.batchClass.create({
              data: {
                batchId: batchId,
                day: day,
                time: time,
                roomId: batch.room.id,
                roomName: batch.room.name,
                batchTime: `${formatTime(batch.time[0] ?? "", "start")} - ${formatTime(batch.time[batch.time.length - 1] ?? "", "end")}`,
                batchName: batch.name,
                subjectId: subjectId,
                subjectName: subject.name,
                teacherId: teacherId,
                teacherName: teacher.name,
              },
            });
          });
          await ctx.db.teacher.update({
            where: {
              id: teacherId,
            },
            data: {
              availableSlots: teacher.availableSlots.filter(
                (slot) => !slots.includes(slot)
              ),
              bookedSlots: {
                push: slots,
              },
            },
          });
        }

        return { success: true, message: "Batch Class created" };
      } catch (error) {
        console.error("Error creating batch class", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("batch_class", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const classId = input;

      try {
        const batchClass = await ctx.db.batchClass.findUnique({
          where: {
            id: classId,
          },
          include: {
            teacher: {
              select: {
                bookedSlots: true,
                id: true,
              },
            },
          },
        });

        if (!batchClass) {
          return { success: false, message: "Batch Class not found" };
        }

        const timeRange = splitTimeRange(batchClass.time || "-");

        const forDays =
          [batchClass.day].map((item: string) => item.toLowerCase()) || [];
        const forTimes = timeRange.map((time) => time.toLowerCase());

        const slots = forDays.flatMap((day: string) =>
          forTimes.map((time) => `${day} ${time}`)
        );

        await ctx.db.$transaction(async (tx) => {
          await tx.batchClass.delete({
            where: {
              id: classId,
            },
          });

          await tx.teacher.update({
            where: {
              id: batchClass.teacherId,
            },
            data: {
              availableSlots: {
                push: slots,
              },
              bookedSlots: batchClass.teacher.bookedSlots.filter(
                (slot) => !slots.includes(slot)
              ),
            },
          });
        });

        return { success: true, message: "Batch Class deleted" };
      } catch (error) {
        console.error("Error deleting batch class", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  getByBatch: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const batchId = input;

      const batch = await ctx.db.batch.findUnique({
        where: {
          id: batchId,
        },
      });

      if (!batch) {
        return [
          {
            day: "",
            time: "",
            classes: [],
          },
        ];
      }

      const batchClasses = await ctx.db.batchClass.findMany({
        where: {
          batchId,
        },
        select: {
          id: true,
          time: true,
          day: true,
          teacherName: true,
          subjectName: true,
          roomName: true,
          teacherId: true,
        },
        orderBy: [{ day: "asc" }, { time: "asc" }],
      });

      const orderedDays = [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
      ];

      const groupedData: GroupedData[] = orderedDays.map((day) => ({
        day,
        time: "",
        classes: [],
      }));

      const sortedClasses = batchClasses.sort((a, b) => {
        const dayComparison =
          orderedDays.indexOf(a.day) - orderedDays.indexOf(b.day);
        if (dayComparison !== 0) return dayComparison;

        return a.time.localeCompare(b.time);
      });

      sortedClasses.forEach((curr: ClassData) => {
        const { day, time, teacherName, subjectName, roomName, id, teacherId } =
          curr;
        const dayGroup = groupedData.find((group) => group.day === day);
        if (dayGroup) {
          dayGroup.classes.push({
            time,
            teacherName,
            subjectName,
            roomName,
            id,
            teacherId,
            className: batch.batchClassName,
          });
        }
      });

      groupedData.forEach((dayGroup) => {
        dayGroup.classes.sort((a, b) => a.time.localeCompare(b.time));
      });

      return groupedData;
    }),
  getByTeacher: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const teacherId = input;

      const classes = await ctx.db.batchClass.groupBy({
        by: [
          "time",
          "day",
          "batchName",
          "subjectName",
          "roomName",
          "id",
          "batchId",
        ],
        where: { teacherId },
        orderBy: { day: "asc" },
      });

      type GroupedTeacherClass = {
        time: string;
        batchId: string;
        classes: {
          day: string;
          batchName: string;
          subjectName: string;
          roomName: string;
          id: string;
        }[];
      };

      const groupedMap: { [key: string]: GroupedTeacherClass } = {};

      classes.forEach((curr) => {
        const { time, batchName, subjectName, day, roomName, id, batchId } =
          curr;
        if (!groupedMap[time]) {
          groupedMap[time] = { time, batchId, classes: [] };
        }
        groupedMap[time].classes.push({
          day,
          batchName,
          subjectName,
          roomName,
          id,
        });
      });

      const groupedData: GroupedTeacherClass[] = Object.values(groupedMap);

      console.log(groupedData);

      return groupedData;
    }),
} satisfies TRPCRouterRecord;
