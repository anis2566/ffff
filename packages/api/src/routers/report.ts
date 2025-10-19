import type { TRPCRouterRecord } from "@trpc/server";
import z from "zod";
import { startOfDay, endOfDay } from "date-fns";

import { allPermissionsProcedure, permissionProcedure } from "../trpc";

import {
  ADMISSION_PAYMENT_STATUS,
  MONTH,
  SALARY_PAYMENT_STATUS,
  TEACHER_PAYMENT_STATUS,
} from "@workspace/utils/constant";

type GroupedData = {
  month: string;
  _sum: {
    amount: number | null;
  };
};

const sumGroupedData = (data: GroupedData[], month: string): number => {
  return data.find((item) => item.month === month)?._sum.amount || 0;
};

const calculateTotal = (data: { month: string; total: number }[]): number => {
  return data.reduce((acc, curr) => acc + curr.total, 0);
};

export const reportRouter = {
  daily: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "daily" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
        date: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session, date } = input;

      const startDate = date
        ? startOfDay(new Date(date))
        : startOfDay(new Date());
      const endDate = date ? endOfDay(new Date(date)) : endOfDay(new Date());

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const [
        dailySalary,
        dailyAdmission,
        dailyOthers,
        dailyHouseRent,
        dailyUtility,
        dailyTeacherAdvance,
      ] = await Promise.all([
        ctx.db.salaryPayment.aggregate({
          where: {
            session: sessionNumber,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            paymentStatus: SALARY_PAYMENT_STATUS.Paid,
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),
        ctx.db.admissionPayment.aggregate({
          where: {
            session: sessionNumber,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            paymentStatus: ADMISSION_PAYMENT_STATUS.Paid,
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),
        ctx.db.otherPayment.aggregate({
          where: {
            session: sessionNumber,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),
        ctx.db.housePayment.aggregate({
          where: {
            session: sessionNumber,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),
        ctx.db.utilityPayment.aggregate({
          where: {
            session: sessionNumber,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),
        ctx.db.teacherAdvance.aggregate({
          where: {
            session: sessionNumber,
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: TEACHER_PAYMENT_STATUS.Paid,
          },
          _sum: {
            amount: true,
          },
          _count: {
            _all: true,
          },
        }),
      ]);

      return {
        dailySalary,
        dailyAdmission,
        dailyOthers,
        dailyHouseRent,
        dailyUtility,
        dailyTeacherAdvance,
      };
    }),
  salaryIncome: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "income" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const salaries = await ctx.db.salaryPayment.groupBy({
        by: ["className", "month"],
        where: {
          session: sessionNumber,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
        _sum: {
          amount: true,
        },
      });

      const modifiedPayment = salaries.reduce(
        (
          acc: {
            className: string;
            months: { month: MONTH; amount: number }[];
          }[],
          payment
        ) => {
          const existingClass = acc.find(
            (item) => item.className === payment.className
          );

          if (existingClass) {
            existingClass.months.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          } else {
            acc.push({
              className: payment.className,
              months: [
                {
                  month: payment.month as MONTH,
                  amount: payment._sum.amount ?? 0,
                },
              ],
            });
          }

          return acc;
        },
        []
      );

      const totalSalary = modifiedPayment.reduce(
        (acc, curr) =>
          acc + curr.months.reduce((sum, month) => sum + month.amount, 0),
        0
      );

      return {
        salaries: modifiedPayment,
        totalSalary,
      };
    }),
  admissionIncome: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "income" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const admissions = await ctx.db.admissionPayment.groupBy({
        by: ["className", "month"],
        where: {
          session: sessionNumber,
          paymentStatus: ADMISSION_PAYMENT_STATUS.Paid,
        },
        _sum: {
          amount: true,
        },
      });

      const modifiedPayment = admissions.reduce(
        (
          acc: {
            className: string;
            months: { month: MONTH; amount: number }[];
          }[],
          payment
        ) => {
          const existingClass = acc.find(
            (item) => item.className === payment.className
          );

          if (existingClass) {
            existingClass.months.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          } else {
            acc.push({
              className: payment.className,
              months: [
                {
                  month: payment.month as MONTH,
                  amount: payment._sum.amount ?? 0,
                },
              ],
            });
          }

          return acc;
        },
        []
      );

      const totalAdmission = modifiedPayment.reduce(
        (acc, curr) =>
          acc + curr.months.reduce((sum, month) => sum + month.amount, 0),
        0
      );

      return {
        admissions: modifiedPayment,
        totalAdmission,
      };
    }),
  otherIncome: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "income" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const others = await ctx.db.otherPayment.groupBy({
        by: ["name", "month"],
        where: {
          session: sessionNumber,
        },
        _sum: {
          amount: true,
        },
      });

      const modifiedPayment = others.reduce(
        (
          acc: { name: string; months: { month: MONTH; amount: number }[] }[],
          payment
        ) => {
          const existingClass = acc.find((item) => item.name === payment.name);

          if (existingClass) {
            existingClass.months.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          } else {
            acc.push({
              name: payment.name,
              months: [
                {
                  month: payment.month as MONTH,
                  amount: payment._sum.amount ?? 0,
                },
              ],
            });
          }

          return acc;
        },
        []
      );

      const totalOthers = modifiedPayment.reduce(
        (acc, curr) =>
          acc + curr.months.reduce((sum, month) => sum + month.amount, 0),
        0
      );

      return {
        others: modifiedPayment,
        totalOthers,
      };
    }),
  income: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "income" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const [salaries, admissions, others] = await Promise.all([
        ctx.db.salaryPayment.groupBy({
          by: ["month"],
          where: {
            session: sessionNumber,
            paymentStatus: SALARY_PAYMENT_STATUS.Paid,
          },
          _sum: {
            amount: true,
          },
        }),
        ctx.db.admissionPayment.groupBy({
          by: ["month"],
          where: {
            session: sessionNumber,
            paymentStatus: ADMISSION_PAYMENT_STATUS.Paid,
          },
          _sum: {
            amount: true,
          },
        }),
        ctx.db.otherPayment.groupBy({
          by: ["month"],
          where: {
            session: sessionNumber,
          },
          _sum: {
            amount: true,
          },
          orderBy: {
            month: "asc",
          },
        }),
      ]);

      const modifiedSalaries = salaries.reduce(
        (acc: { month: MONTH; amount: number }[], payment) => {
          const existingClass = acc.find(
            (item) => item.month === payment.month
          );

          if (existingClass) {
            existingClass.amount += payment._sum.amount ?? 0;
          } else {
            acc.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          }

          return acc;
        },
        []
      );

      const modifiedAdmissions = admissions.reduce(
        (acc: { month: MONTH; amount: number }[], payment) => {
          const existingClass = acc.find(
            (item) => item.month === payment.month
          );

          if (existingClass) {
            existingClass.amount += payment._sum.amount ?? 0;
          } else {
            acc.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          }

          return acc;
        },
        []
      );

      const modifiedOthers = others.reduce(
        (acc: { month: MONTH; amount: number }[], payment) => {
          const existingClass = acc.find(
            (item) => item.month === payment.month
          );

          if (existingClass) {
            existingClass.amount += payment._sum.amount ?? 0;
          } else {
            acc.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          }

          return acc;
        },
        []
      );

      return {
        salaries: modifiedSalaries,
        admissions: modifiedAdmissions,
        others: modifiedOthers,
      };
    }),
  teacherExpense: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "expense" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const payments = await ctx.db.teacherPayment.groupBy({
        by: ["teacherName", "teacherIndex", "month"],
        where: {
          session: sessionNumber,
          status: TEACHER_PAYMENT_STATUS.Paid,
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          teacherIndex: "asc",
        },
      });

      const modifiedPayment = payments.reduce(
        (
          acc: {
            teacherName: string;
            teacherIndex: number;
            months: { month: MONTH; amount: number }[];
          }[],
          payment
        ) => {
          const existingClass = acc.find(
            (item) => item.teacherName === payment.teacherName
          );

          if (existingClass) {
            existingClass.months.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          } else {
            acc.push({
              teacherName: payment.teacherName,
              teacherIndex: payment.teacherIndex,
              months: [
                {
                  month: payment.month as MONTH,
                  amount: payment._sum.amount ?? 0,
                },
              ],
            });
          }

          return acc;
        },
        []
      );

      const totalPayment = modifiedPayment.reduce(
        (acc, curr) =>
          acc + curr.months.reduce((sum, month) => sum + month.amount, 0),
        0
      );

      return {
        payments: modifiedPayment,
        totalPayment,
      };
    }),
  houseExpense: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "expense" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const houses = await ctx.db.housePayment.groupBy({
        by: ["houseName", "month"],
        where: {
          session: sessionNumber,
        },
        _sum: {
          amount: true,
        },
      });

      const modifiedPayment = houses.reduce(
        (
          acc: {
            houseName: string;
            months: { month: MONTH; amount: number }[];
          }[],
          payment
        ) => {
          const existingClass = acc.find(
            (item) => item.houseName === payment.houseName
          );

          if (existingClass) {
            existingClass.months.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          } else {
            acc.push({
              houseName: payment.houseName,
              months: [
                {
                  month: payment.month as MONTH,
                  amount: payment._sum.amount ?? 0,
                },
              ],
            });
          }

          return acc;
        },
        []
      );

      const totalPayment = modifiedPayment.reduce(
        (acc, curr) =>
          acc + curr.months.reduce((sum, month) => sum + month.amount, 0),
        0
      );

      return {
        houses: modifiedPayment,
        totalPayment,
      };
    }),
  utilityExpense: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "expense" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const utilities = await ctx.db.utilityPayment.groupBy({
        by: ["name", "month"],
        where: {
          session: sessionNumber,
        },
        _sum: {
          amount: true,
        },
      });

      const modifiedPayment = utilities.reduce(
        (
          acc: { name: string; months: { month: MONTH; amount: number }[] }[],
          payment
        ) => {
          const existingClass = acc.find((item) => item.name === payment.name);

          if (existingClass) {
            existingClass.months.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          } else {
            acc.push({
              name: payment.name,
              months: [
                {
                  month: payment.month as MONTH,
                  amount: payment._sum.amount ?? 0,
                },
              ],
            });
          }

          return acc;
        },
        []
      );

      const totalPayment = modifiedPayment.reduce(
        (acc, curr) =>
          acc + curr.months.reduce((sum, month) => sum + month.amount, 0),
        0
      );

      return {
        utilities: modifiedPayment,
        totalPayment,
      };
    }),
  expense: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "expense" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const [teachers, houses, utilities] = await Promise.all([
        ctx.db.teacherPayment.groupBy({
          by: ["month"],
          where: {
            session: sessionNumber,
            status: TEACHER_PAYMENT_STATUS.Paid,
          },
          _sum: {
            amount: true,
          },
        }),
        ctx.db.housePayment.groupBy({
          by: ["month"],
          where: {
            session: sessionNumber,
          },
          _sum: {
            amount: true,
          },
        }),
        ctx.db.utilityPayment.groupBy({
          by: ["month"],
          where: {
            session: sessionNumber,
          },
          _sum: {
            amount: true,
          },
        }),
      ]);

      const modifiedTeachers = teachers.reduce(
        (acc: { month: MONTH; amount: number }[], payment) => {
          const existingClass = acc.find(
            (item) => item.month === payment.month
          );

          if (existingClass) {
            existingClass.amount += payment._sum.amount ?? 0;
          } else {
            acc.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          }

          return acc;
        },
        []
      );

      const modifiedHouses = houses.reduce(
        (acc: { month: MONTH; amount: number }[], payment) => {
          const existingClass = acc.find(
            (item) => item.month === payment.month
          );

          if (existingClass) {
            existingClass.amount += payment._sum.amount ?? 0;
          } else {
            acc.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          }

          return acc;
        },
        []
      );

      const modifiedUtilities = utilities.reduce(
        (acc: { month: MONTH; amount: number }[], payment) => {
          const existingClass = acc.find(
            (item) => item.month === payment.month
          );

          if (existingClass) {
            existingClass.amount += payment._sum.amount ?? 0;
          } else {
            acc.push({
              month: payment.month as MONTH,
              amount: payment._sum.amount ?? 0,
            });
          }

          return acc;
        },
        []
      );

      return {
        teachers: modifiedTeachers,
        houses: modifiedHouses,
        utilities: modifiedUtilities,
      };
    }),
  overview: allPermissionsProcedure([
    { module: "report", action: "read" },
    { module: "report", action: "final" },
  ])
    .input(
      z.object({
        session: z.string().nullish(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { session } = input;

      const sessionNumber = session
        ? session
        : new Date().getFullYear().toString();

      const [salaries, admissions, others, teachers, houses, utilities] =
        await Promise.all([
          ctx.db.salaryPayment.groupBy({
            by: ["month"],
            where: {
              session: sessionNumber,
              paymentStatus: SALARY_PAYMENT_STATUS.Paid,
            },
            _sum: {
              amount: true,
            },
          }),
          ctx.db.admissionPayment.groupBy({
            by: ["month"],
            where: {
              session: sessionNumber,
              paymentStatus: ADMISSION_PAYMENT_STATUS.Paid,
            },
            _sum: {
              amount: true,
            },
          }),
          ctx.db.otherPayment.groupBy({
            by: ["month"],
            where: {
              session: sessionNumber,
            },
            _sum: {
              amount: true,
            },
          }),
          ctx.db.teacherPayment.groupBy({
            by: ["month"],
            where: {
              session: sessionNumber,
              status: TEACHER_PAYMENT_STATUS.Paid,
            },
            _sum: {
              amount: true,
            },
          }),
          ctx.db.housePayment.groupBy({
            by: ["month"],
            where: {
              session: sessionNumber,
            },
            _sum: {
              amount: true,
            },
          }),
          ctx.db.utilityPayment.groupBy({
            by: ["month"],
            where: {
              session: sessionNumber,
            },
            _sum: {
              amount: true,
            },
          }),
        ]);

      const combinedDataIncome = Object.values(MONTH).map((month) => ({
        month,
        total:
          sumGroupedData(salaries, month) +
          sumGroupedData(admissions, month) +
          sumGroupedData(others, month),
      }));

      const totalIncome = calculateTotal(combinedDataIncome);

      const combinedDataExpense = Object.values(MONTH).map((month) => ({
        month,
        total:
          sumGroupedData(teachers, month) +
          sumGroupedData(houses, month) +
          sumGroupedData(utilities, month),
      }));

      const totalExpense = calculateTotal(combinedDataExpense);

      const combinedDataProfit = Object.values(MONTH).map((month) => ({
        month,
        total:
          (combinedDataIncome.find((item) => item.month === month)?.total ||
            0) -
          (combinedDataExpense.find((item) => item.month === month)?.total ||
            0),
      }));

      const totalProfit = calculateTotal(combinedDataProfit);

      return {
        totalIncomeData: combinedDataIncome,
        totalExpenseData: combinedDataExpense,
        totalProfitData: combinedDataProfit,
        totalIncome,
        totalExpense,
        totalProfit,
      };
    }),
} satisfies TRPCRouterRecord;
