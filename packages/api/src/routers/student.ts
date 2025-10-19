import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";

import { permissionProcedure, protectedProcedure } from "../trpc";

import { FindStudentSchema, StudentSchema } from "@workspace/utils/schemas";
import {
  ADMISSION_PAYMENT_STATUS,
  ADMISSION_STATUS,
  MONTH,
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
  STUDENT_STATUS,
} from "@workspace/utils/constant";

export const studentRouter = {
  createOne: permissionProcedure("student", "create")
    .input(StudentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const existingStudent = await ctx.db.student.findFirst({
          where: {
            classNameId: input.classNameId,
            studentId: parseInt(input.studentId),
          },
        });

        if (existingStudent) {
          return {
            success: false,
            message: "Student with this ID already exists",
          };
        }

        const months = Object.values(MONTH);
        const currentMonthIndex = new Date().getMonth();
        const currentMonth = Object.values(MONTH)[currentMonthIndex] as string;

        await ctx.db.$transaction(
          async (tx) => {
            const newStudent = await tx.student.create({
              data: {
                ...input,
                session: new Date().getFullYear().toString(),
                studentId: parseInt(input.studentId),
                dob: new Date(input.dob),
                roll: parseInt(input.roll),
                admissionFee: parseInt(input.admissionFee),
                salaryFee: parseInt(input.salaryFee),
                courseFee: null,
                studentStatus: {
                  create: {
                    status: STUDENT_STATUS.Present,
                  },
                },
              },
              select: {
                id: true,
                className: {
                  select: {
                    name: true,
                  },
                },
              },
            });

            await tx.admissionPayment.create({
              data: {
                className: newStudent.className.name,
                amount: parseInt(input.admissionFee),
                method: "N/A",
                session: new Date().getFullYear().toString(),
                month: currentMonth,
                studentId: newStudent.id,
                status: ADMISSION_STATUS.Present,
                paymentStatus: ADMISSION_PAYMENT_STATUS.Unpaid,
              },
            });

            for (let i = 0; i < months.length; i++) {
              let status: string;
              let paymentStatus: string | undefined;

              if (i < currentMonthIndex) {
                status = "N/A";
                paymentStatus = "N/A";
              } else if (i === currentMonthIndex) {
                status = SALARY_STATUS.Present;
                paymentStatus = SALARY_PAYMENT_STATUS.Unpaid;
              } else {
                status = SALARY_STATUS.Initiated;
                paymentStatus = SALARY_PAYMENT_STATUS["N/A"];
              }

              await tx.salaryPayment.create({
                data: {
                  session: new Date().getFullYear().toString(),
                  month: months[i] as string,
                  studentId: newStudent.id,
                  className: newStudent.className.name,
                  method: "N/A",
                  status: status,
                  ...(paymentStatus && { paymentStatus }),
                  amount: parseInt(input.salaryFee),
                },
              });
            }

            await tx.counter.update({
              where: {
                type: newStudent.className.name,
              },
              data: {
                value: {
                  increment: 1,
                },
              },
            });
          },
          {
            timeout: 15000,
            maxWait: 10000,
          }
        );

        return { success: true, message: "Admission successfull" };
      } catch (error) {
        console.error("Error creating admission", error);

        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }

        return {
          success: false,
          message: "Internal Server Error",
          // In development, you might want to include:
          // error: error instanceof Error ? error.message : "Unknown error"
        };
      }
    }),
  updateOne: permissionProcedure("student", "update")
    .input(
      z.object({
        ...StudentSchema.shape,
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...rest } = input;

      try {
        const existingStudent = await ctx.db.student.findUnique({
          where: { id },
        });

        if (!existingStudent) {
          return { success: false, message: "Student not found" };
        }

        await ctx.db.student.update({
          where: { id },
          data: {
            ...rest,
            session: new Date().getFullYear().toString(),
            studentId: parseInt(input.studentId),
            dob: new Date(input.dob),
            roll: parseInt(input.roll),
            admissionFee: parseInt(input.admissionFee),
            salaryFee: parseInt(input.salaryFee),
            courseFee: null,
          },
        });

        return { success: true, message: "Student updated" };
      } catch (error) {
        console.error("Error updating student", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  batchTransfer: permissionProcedure("student", "batch_transfer")
    .input(
      z.object({
        studentId: z.string(),
        batchId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { studentId, batchId } = input;

      try {
        await ctx.db.student.update({
          where: { id: studentId },
          data: {
            batchId,
          },
        });

        return { success: true, message: "Batch transfer successfull" };
      } catch (error) {
        console.error("Error updating batch transfer", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  markAsAbsent: permissionProcedure("student", "toggle_present")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const studentId = input;

      try {
        const existingStudent = await ctx.db.student.findUnique({
          where: { id: studentId },
        });

        if (!existingStudent) {
          return { success: false, message: "Student not found" };
        }

        await ctx.db.$transaction(async (tx) => {
          await tx.student.update({
            where: { id: studentId },
            data: {
              batchId: null,
            },
          });
          await tx.studentStatus.update({
            where: { studentId },
            data: {
              status: STUDENT_STATUS.Absent,
            },
          });
        });

        return { success: true, message: "Marked as absent" };
      } catch (error) {
        console.error("Error updating mark as absent", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  markAsPresent: permissionProcedure("student", "toggle_present")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const studentId = input;

      try {
        const existingStudent = await ctx.db.student.findUnique({
          where: { id: studentId },
        });

        if (!existingStudent) {
          return { success: false, message: "Student not found" };
        }

        await ctx.db.studentStatus.update({
          where: { studentId },
          data: {
            status: STUDENT_STATUS.Present,
          },
        });

        return { success: true, message: "Marked as present" };
      } catch (error) {
        console.error("Error updating mark as present", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  deleteOne: permissionProcedure("student", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const studentId = input;

      try {
        const existingStudent = await ctx.db.student.findUnique({
          where: { id: studentId },
        });

        if (!existingStudent) {
          return { success: false, message: "Student not found" };
        }

        await ctx.db.student.delete({
          where: { id: studentId },
        });

        return { success: true, message: "Student deleted" };
      } catch (error) {
        console.error("Error deleting student", error);
        return { success: false, message: "Internal Server Error" };
      }
    }),
  forPaymentSelect: protectedProcedure
    .input(FindStudentSchema)
    .mutation(async ({ input, ctx }) => {
      const { classNameId, search } = input;

      const isNumberSearch = !isNaN(parseInt(search));
      const isPhoneSearch = search.length === 11 && isNumberSearch;

      try {
        const student = await ctx.db.student.findFirst({
          where: {
            classNameId: classNameId,
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              ...(isPhoneSearch
                ? [
                    {
                      mPhone: {
                        contains: search,
                      },
                    },
                    {
                      fPhone: {
                        contains: search,
                      },
                    },
                  ]
                : []),
              ...(isNumberSearch && !isPhoneSearch
                ? [
                    {
                      studentId: parseInt(search),
                    },
                  ]
                : []),
            ],
          },
          select: {
            name: true,
            studentId: true,
            imageUrl: true,
            salaryFee: true,
            className: {
              select: {
                name: true,
              },
            },
            salaryPayments: {
              where: {
                paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
              },
              select: {
                month: true,
                amount: true,
                status: true,
                paymentStatus: true,
                id: true,
              },
            },
          },
        });

        if (!student) {
          return {
            success: false,
            message: "Student not found",
            student: null,
          };
        }

        return {
          success: true,
          student,
          data: student,
          message: "Student found",
        };
      } catch (error) {
        console.error(`Error getting student for payment select: ${error}`);
        return {
          success: false,
          message: "Internal Server Error",
          student: null,
        };
      }
    }),
  getByBatch: protectedProcedure
    .input(z.string().nullish())
    .query(async ({ input, ctx }) => {
      const batchId = input;

      if (!batchId) {
        return [];
      }

      const students = await ctx.db.student.findMany({
        where: {
          batchId,
        },
        select: {
          id: true,
          name: true,
          studentId: true,
          imageUrl: true,
          mPhone: true,
          salaryPayments: {
            where: {
              paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
            },
            select: {
              id: true,
            },
          },
          batch: {
            select: {
              name: true,
            },
          },
          classNameId: true,
          batchId: true,
        },
      });

      return students;
    }),
  getOne: protectedProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const studentId = input;

    const studentData = await ctx.db.student.findUnique({
      where: { id: studentId },
      include: {
        studentStatus: true,
      },
    });

    if (!studentData) {
      throw new Error("Student not found");
    }

    return studentData;
  }),
  getAbsentMany: permissionProcedure("student", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, className, id } = input;

      const [students, totalCount] = await Promise.all([
        ctx.db.student.findMany({
          where: {
            studentStatus: {
              status: STUDENT_STATUS.Absent,
            },
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(id && {
              studentId: parseInt(id),
            }),
          },
          include: {
            className: true,
            studentStatus: true,
            salaryPayments: {
              where: {
                paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
              },
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
        ctx.db.student.count({
          where: {
            studentStatus: {
              status: STUDENT_STATUS.Absent,
            },
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(id && {
              studentId: parseInt(id),
            }),
          },
        }),
      ]);

      return {
        students,
        totalCount,
      };
    }),
  getMany: permissionProcedure("student", "read")
    .input(
      z.object({
        page: z.number(),
        limit: z.number().min(1).max(100),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, className, id } = input;

      const [students, totalCount] = await Promise.all([
        ctx.db.student.findMany({
          where: {
            studentStatus: {
              status: STUDENT_STATUS.Present,
            },
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(id && {
              studentId: parseInt(id),
            }),
          },
          include: {
            className: true,
            studentStatus: true,
            batch: {
              select: {
                name: true,
              },
            },
            salaryPayments: {
              where: {
                paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
              },
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
        ctx.db.student.count({
          where: {
            studentStatus: {
              status: STUDENT_STATUS.Present,
            },
            ...(search && {
              name: {
                contains: search,
                mode: "insensitive",
              },
            }),
            ...(session && {
              session,
            }),
            ...(className && {
              className: {
                name: className,
              },
            }),
            ...(id && {
              studentId: parseInt(id),
            }),
          },
        }),
      ]);

      return {
        students,
        totalCount,
      };
    }),
} satisfies TRPCRouterRecord;
