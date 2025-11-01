import type { TRPCRouterRecord } from "@trpc/server";
import type { Prisma } from "@workspace/db";
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

// Shared error handler
const handleError = (error: unknown, operation: string) => {
  console.error(`Error ${operation}:`, error);
  if (error instanceof Error) {
    console.error("Error details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
  }
  return { success: false, message: "Internal Server Error" };
};

// Build search filter with proper typing
const buildSearchFilter = (search?: string | null): Prisma.StudentWhereInput =>
  search ? { name: { contains: search, mode: "insensitive" as const } } : {};

// Build student where clause
const buildStudentWhereClause = (
  status: string,
  search?: string | null,
  session?: string | null,
  className?: string | null,
  id?: string | null
): Prisma.StudentWhereInput => ({
  studentStatus: { status },
  ...buildSearchFilter(search),
  ...(session && { session }),
  ...(className && { className: { name: className } }),
  ...(id && { studentId: parseInt(id, 10) }),
});

// Get current year and month
const getCurrentSession = () => new Date().getFullYear().toString();
const getCurrentMonth = () => {
  const currentMonthIndex = new Date().getMonth();
  return Object.values(MONTH)[currentMonthIndex] as string;
};

export const studentRouter = {
  createOne: permissionProcedure("student", "create")
    .input(StudentSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const existingStudent = await ctx.db.student.findFirst({
          where: {
            classNameId: input.classNameId,
            studentId: parseInt(input.studentId, 10),
          },
          select: { id: true },
        });

        if (existingStudent) {
          return {
            success: false,
            message: "Student with this ID already exists",
          };
        }

        const months = Object.values(MONTH);
        const currentMonthIndex = new Date().getMonth();
        const currentMonth = getCurrentMonth();

        await ctx.db.$transaction(
          async (tx) => {
            const newStudent = await tx.student.create({
              data: {
                ...input,
                studentId: parseInt(input.studentId, 10),
                dob: new Date(input.dob),
                roll: parseInt(input.roll, 10),
                admissionFee: parseInt(input.admissionFee, 10),
                salaryFee: parseInt(input.salaryFee, 10),
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

            // Create admission payment
            await tx.admissionPayment.create({
              data: {
                className: newStudent.className.name,
                amount: parseInt(input.admissionFee, 10),
                method: "N/A",
                session: input.session,
                month: currentMonth,
                studentId: newStudent.id,
                status: ADMISSION_STATUS.Present,
                paymentStatus: ADMISSION_PAYMENT_STATUS.Unpaid,
                updatedBy: ctx.session?.user.name,
              },
            });

            // Create salary payments for all months
            const salaryPayments = months.map((month, i) => {
              let status: string;
              let paymentStatus: string;

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

              return {
                session: input.session,
                month: month as string,
                studentId: newStudent.id,
                className: newStudent.className.name,
                method: "N/A",
                status,
                paymentStatus,
                amount: parseInt(input.salaryFee, 10),
                updatedBy: ctx.session?.user.name,
              };
            });

            await tx.salaryPayment.createMany({
              data: salaryPayments,
            });

            // Update counter
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

        return { success: true, message: "Admission successful" };
      } catch (error) {
        return handleError(error, "creating admission");
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
          select: { id: true },
        });

        if (!existingStudent) {
          return { success: false, message: "Student not found" };
        }

        await ctx.db.student.update({
          where: { id },
          data: {
            ...rest,
            studentId: parseInt(input.studentId, 10),
            dob: new Date(input.dob),
            roll: parseInt(input.roll, 10),
            admissionFee: parseInt(input.admissionFee, 10),
            salaryFee: parseInt(input.salaryFee, 10),
            courseFee: null,
          },
        });

        return { success: true, message: "Student updated successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Student not found" };
        }
        return handleError(error, "updating student");
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
          data: { batchId },
        });

        return { success: true, message: "Batch transfer successful" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Student not found" };
        }
        return handleError(error, "batch transfer");
      }
    }),

  markAsAbsent: permissionProcedure("student", "toggle_present")
    .input(
      z.object({
        studentId: z.string(),
        reason: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { studentId, reason } = input;
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.student.update({
            where: { id: studentId },
            data: { batchId: null },
          });
          await tx.studentStatus.update({
            where: { studentId },
            data: { status: STUDENT_STATUS.Absent, absentReason: reason },
          });
        });

        return { success: true, message: "Marked as absent successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Student not found" };
        }
        return handleError(error, "marking as absent");
      }
    }),

  markAsPresent: permissionProcedure("student", "toggle_present")
    .input(
      z.object({
        studentId: z.string(),
        batchId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { studentId, batchId } = input;
      try {
        await ctx.db.$transaction(async (tx) => {
          await tx.student.update({
            where: { id: studentId },
            data: { batchId },
          });
          await tx.studentStatus.update({
            where: { studentId },
            data: { status: STUDENT_STATUS.Present, absentReason: null },
          });
        });
        return { success: true, message: "Marked as present successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Student not found" };
        }
        return handleError(error, "marking as present");
      }
    }),

  deleteOne: permissionProcedure("student", "delete")
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      try {
        await ctx.db.student.delete({
          where: { id: input },
        });

        return { success: true, message: "Student deleted successfully" };
      } catch (error) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "P2025"
        ) {
          return { success: false, message: "Student not found" };
        }
        return handleError(error, "deleting student");
      }
    }),

  forPaymentSelect: protectedProcedure
    .input(FindStudentSchema)
    .mutation(async ({ input, ctx }) => {
      const { classNameId, search } = input;

      const isNumberSearch = !isNaN(parseInt(search, 10));
      const isPhoneSearch = search.length === 11 && isNumberSearch;

      const className = await ctx.db.className.findFirst({
        where: { id: classNameId },
        select: {
          name: true,
          session: true,
        },
      });

      try {
        const student = await ctx.db.student.findFirst({
          where: {
            session: className?.session,
            classNameId,
            OR: [
              {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              ...(isPhoneSearch
                ? [
                    { mPhone: { contains: search } },
                    { fPhone: { contains: search } },
                  ]
                : []),
              ...(isNumberSearch && !isPhoneSearch
                ? [{ studentId: parseInt(search, 10) }]
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
        console.error("Error getting student for payment select:", error);
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
      if (!input) {
        return [];
      }

      const students = await ctx.db.student.findMany({
        where: {
          batchId: input,
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
    const student = await ctx.db.student.findUnique({
      where: { id: input },
      include: {
        studentStatus: true,
      },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  }),

  getAbsentMany: permissionProcedure("student", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, className, id } = input;

      const where = buildStudentWhereClause(
        STUDENT_STATUS.Absent,
        search,
        session,
        className,
        id
      );

      const [students, totalCount] = await Promise.all([
        ctx.db.student.findMany({
          where,
          include: {
            className: {
              select: {
                name: true,
              },
            },
            institute: {
              select: {
                name: true,
              },
            },
            studentStatus: true,
            _count: {
              select: {
                salaryPayments: {
                  where: {
                    paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.student.count({ where }),
      ]);

      return {
        students,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),

  getMany: permissionProcedure("student", "read")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(10),
        sort: z.string().nullish(),
        search: z.string().nullish(),
        session: z.string().nullish(),
        className: z.string().nullish(),
        id: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { page, limit, sort, search, session, className, id } = input;

      const where = buildStudentWhereClause(
        STUDENT_STATUS.Present,
        search,
        session,
        className,
        id
      );

      const [students, totalCount] = await Promise.all([
        ctx.db.student.findMany({
          where,
          include: {
            className: {
              select: {
                name: true,
              },
            },
            institute: {
              select: {
                name: true,
              },
            },
            studentStatus: true,
            batch: {
              select: {
                name: true,
              },
            },
            _count: {
              select: {
                salaryPayments: {
                  where: {
                    paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: sort === "asc" ? "asc" : "desc",
          },
          take: limit,
          skip: (page - 1) * limit,
        }),
        ctx.db.student.count({ where }),
      ]);

      return {
        students,
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      };
    }),
} satisfies TRPCRouterRecord;
