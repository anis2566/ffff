import type { TRPCRouterRecord } from "@trpc/server";
import { endOfMonth, startOfMonth, startOfDay, endOfDay } from "date-fns";

import { allPermissionsProcedure } from "../trpc";
import {
  MONTH,
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
  STUDENT_STATUS,
  TEACHER_STATUS,
} from "@workspace/utils/constant";

export const dashboardRouter = {
  admin: allPermissionsProcedure([
    { module: "dashboard", action: "read" },
    { module: "dashboard", action: "admin" },
  ]).query(async ({ ctx }) => {
    const currentYear = new Date().getFullYear().toString();
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const [
      totalStudent,
      presentStudent,
      absentStudent,
      totalTeacher,
      studentsByClass,
      thisMonthAdmissions,
      thisMonthLeavings,
      thisMonthPaidSalaries,
      thisMonthUnpaidSalaries,
      allClasses,
    ] = await Promise.all([
      ctx.db.student.count({
        where: {
          session: currentYear,
        },
      }),
      ctx.db.student.count({
        where: {
          session: currentYear,
          studentStatus: {
            status: STUDENT_STATUS.Present,
          },
        },
      }),
      ctx.db.student.count({
        where: {
          session: currentYear,
          studentStatus: {
            status: STUDENT_STATUS.Absent,
          },
        },
      }),
      ctx.db.teacher.count({
        where: {
          teacherStatus: {
            status: TEACHER_STATUS.Present,
          },
        },
      }),
      ctx.db.student.groupBy({
        by: ["classNameId"],
        where: {
          session: currentYear,
        },
        _count: {
          id: true,
        },
      }),
      ctx.db.student.groupBy({
        by: ["createdAt"],
        where: {
          session: currentYear,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
        _count: {
          createdAt: true,
        },
      }),
      ctx.db.student.groupBy({
        by: ["createdAt"],
        where: {
          session: currentYear,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
          studentStatus: {
            status: STUDENT_STATUS.Absent,
          },
        },
        _count: {
          createdAt: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          session: currentYear,
          month: Object.values(MONTH)[new Date().getMonth()],
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
        _sum: {
          amount: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          session: currentYear,
          month: Object.values(MONTH)[new Date().getMonth()],
          paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
        },
        _sum: {
          amount: true,
        },
      }),
      ctx.db.className.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          position: "asc",
        },
      }),
    ]);

    // Get class details for students by class
    const classDetails = allClasses.filter((cls) =>
      studentsByClass.some((item) => item.classNameId === cls.id)
    );

    const studentsByClassWithNames = studentsByClass.map((item) => {
      const classInfo = classDetails.find((c) => c.id === item.classNameId);
      return {
        classNameId: item.classNameId,
        className: classInfo?.name,
        studentCount: item._count.id,
      };
    });

    const formattedMonthAdmissions = thisMonthAdmissions.map((admission) => ({
      day: new Date(admission.createdAt).getDate(),
      count: admission._count.createdAt,
    }));

    const formattedMonthLeavings = thisMonthLeavings.map((leave) => ({
      day: new Date(leave.createdAt).getDate(),
      count: leave._count.createdAt,
    }));

    const daysInMonth = Array.from(
      { length: endOfMonth(new Date()).getDate() },
      (_, i) => i + 1
    );

    const MonthAdmissionsLeavingsChart = daysInMonth.map((day) => ({
      day: day,
      admissions:
        formattedMonthAdmissions.find((admission) => admission.day === day)
          ?.count || 0,
      leavings:
        formattedMonthLeavings.find((leave) => leave.day === day)?.count || 0,
    }));

    const formattedSalaries = allClasses.map((cls) => ({
      className: cls.name,
      paid:
        thisMonthPaidSalaries.find((salary) => salary.className === cls.name)
          ?._sum.amount || 0,
      unpaid:
        thisMonthUnpaidSalaries.find((salary) => salary.className === cls.name)
          ?._sum.amount || 0,
    }));

    return {
      totalStudent,
      presentStudent,
      absentStudent,
      totalTeacher,
      studentsByClass: studentsByClassWithNames,
      thisMonthAdmissionsLeavings: MonthAdmissionsLeavingsChart,
      salariesByClass: formattedSalaries,
    };
  }),
  account: allPermissionsProcedure([
    { module: "dashboard", action: "read" },
    { module: "dashboard", action: "account" },
  ]).query(async ({ ctx }) => {
    const currentMonth = Object.values(MONTH)[new Date().getMonth()];
    const lastMonth = Object.values(MONTH)[new Date().getMonth() - 1];

    const startDate = startOfDay(new Date());
    const endDate = endOfDay(new Date());

    const [
      thisMonthSalaryCount,
      thisMonthPaidSalaryCount,
      lastMonthSalaryCount,
      lastMonthPaidSalaryCount,
      totalSalaryCount,
      totalPaidSalaryCount,
      thisMonthSalaries,
      thisMonthPaidSalaries,
      lastMonthSalaries,
      lastMonthPaidSalaries,
      overallSalaries,
      overallPaidSalaries,
      todaySalaries,
      thisMonthUnpaidSalaries,
      recentSalaries,
      classesNames,
    ] = await Promise.all([
      ctx.db.salaryPayment.count({
        where: {
          month: currentMonth,
          status: SALARY_STATUS.Present,
        },
      }),
      ctx.db.salaryPayment.count({
        where: {
          month: currentMonth,
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
      }),
      ctx.db.salaryPayment.count({
        where: {
          month: lastMonth,
          status: SALARY_STATUS.Present,
        },
      }),
      ctx.db.salaryPayment.count({
        where: {
          month: lastMonth,
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
      }),
      ctx.db.salaryPayment.count({
        where: {
          status: SALARY_STATUS.Present,
        },
      }),
      ctx.db.salaryPayment.count({
        where: {
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          month: currentMonth,
          status: SALARY_STATUS.Present,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          month: currentMonth,
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          month: lastMonth,
          status: SALARY_STATUS.Present,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          month: lastMonth,
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          status: SALARY_STATUS.Present,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.groupBy({
        by: ["className"],
        where: {
          month: currentMonth,
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Unpaid,
        },
        _count: {
          _all: true,
        },
      }),
      ctx.db.salaryPayment.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: SALARY_STATUS.Present,
          paymentStatus: SALARY_PAYMENT_STATUS.Paid,
        },
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
              className: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      ctx.db.className.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          position: "asc",
        },
      }),
    ]);

    const classes = classesNames.map((className) => className.name);

    const thisMonthFormattedSalaries = classes.map((className) => ({
      className,
      total:
        thisMonthSalaries.find((salary) => salary.className === className)
          ?._count._all || 0,
      paid:
        thisMonthPaidSalaries.find((salary) => salary.className === className)
          ?._count._all || 0,
    }));

    const todayFormattedSalaries = classes.map((className) => ({
      className,
      total:
        todaySalaries.find((salary) => salary.className === className)?._count
          ._all || 50,
    }));

    const thisMonthFormattedUnpaidSalaries = classes.map((className) => ({
      className,
      total:
        thisMonthUnpaidSalaries.find((salary) => salary.className === className)
          ?._count._all || 0,
    }));

    const lastMonthFormattedSalaries = classes.map((className) => ({
      className,
      total:
        lastMonthSalaries.find((salary) => salary.className === className)
          ?._count._all || 0,
      paid:
        lastMonthPaidSalaries.find((salary) => salary.className === className)
          ?._count._all || 0,
    }));

    const overallFormattedSalaries = classes.map((className) => ({
      className,
      total:
        overallSalaries.find((salary) => salary.className === className)?._count
          ._all || 0,
      paid:
        overallPaidSalaries.find((salary) => salary.className === className)
          ?._count._all || 0,
    }));

    return {
      thisMonthSalaryCount,
      thisMonthPaidSalaryCount,
      lastMonthSalaryCount,
      lastMonthPaidSalaryCount,
      totalSalaryCount,
      totalPaidSalaryCount,
      thisMonthSalaries: thisMonthFormattedSalaries,
      lastMonthSalaries: lastMonthFormattedSalaries,
      overallSalaries: overallFormattedSalaries,
      todaySalaries: todayFormattedSalaries,
      thisMonthUnpaidSalaries: thisMonthFormattedUnpaidSalaries,
      recentSalaries,
    };
  }),
  computerOperator: allPermissionsProcedure([
    { module: "dashboard", action: "read" },
    { module: "dashboard", action: "computer_operator" },
  ]).query(async ({ ctx }) => {
    const userId = ctx?.session?.user.id || "";

    const startDate = startOfDay(new Date());
    const endDate = endOfDay(new Date());

    const [
      todayTotalDocuments,
      todayCompletedDocuments,
      todayInProgressDocuments,
      upcomingTasks,
    ] = await Promise.all([
      ctx.db.document.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          userId,
        },
      }),
      ctx.db.document.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          userId,
          hasFinished: true,
        },
      }),
      ctx.db.document.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          userId,
          hasFinished: false,
        },
      }),
      ctx.db.document.findMany({
        where: {
          userId,
          hasFinished: false,
        },
        include: {
          className: {
            select: {
              name: true,
            },
          },
          subject: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          deliveryDate: "asc",
        },
        take: 5,
      }),
    ]);

    return {
      todayTotalDocuments,
      todayCompletedDocuments,
      todayInProgressDocuments,
      upcomingTasks,
    };
  }),
} satisfies TRPCRouterRecord;
