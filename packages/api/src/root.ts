import { createTRPCRouter } from "./trpc";

import { authRouter } from "./routers/auth";
import { classRouter } from "./routers/class";
import { subjectRouter } from "./routers/subject";
import { counterRouter } from "./routers/counter";
import { admissionFeeRouter } from "./routers/admission-fee";
import { salaryFeeRouter } from "./routers/salary-fee";
import { instituteRouter } from "./routers/institute";
import { studentRouter } from "./routers/student";
import { salaryPaymentRouter } from "./routers/salary-payment";
import { admissionPaymentRouter } from "./routers/admission-payment";
import { teacherRouter } from "./routers/teacher";
import { houseRouter } from "./routers/house";
import { roomRouter } from "./routers/room";
import { batchRouter } from "./routers/batch";
import { batchClassRouter } from "./routers/batch-class";
import { teacherAdvanceRouter } from "./routers/teacher-advance";
import { housePaymentRouter } from "./routers/house-payment";
import { utilityPaymentRouter } from "./routers/utility-payment";
import { otherPaymentRouter } from "./routers/other-payment";
import { teacherPaymentRouter } from "./routers/teacher-payment";
import { reportRouter } from "./routers/report";
import { studentAttendanceRouter } from "./routers/student-attendance";
import { homeworkRouter } from "./routers/homework";
import { examCategoryRouter } from "./routers/exam-category";
import { examRouter } from "./routers/exam";
import { dashboardRouter } from "./routers/dashboard";
import { examResultRouter } from "./routers/exam-result";
import { documentRouter } from "./routers/document";
import { printTaskRouter } from "./routers/print-task";
import { todoRouter } from "./routers/todo";
import { userRouter } from "./routers/user";
import { roleRouter } from "./routers/role";
import { permissionRouter } from "./routers/permission";
import { rbacRouter } from "./routers/rbac";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  class: classRouter,
  subject: subjectRouter,
  counter: counterRouter,
  admissionFee: admissionFeeRouter,
  salaryFee: salaryFeeRouter,
  institute: instituteRouter,
  student: studentRouter,
  salaryPayment: salaryPaymentRouter,
  admissionPayment: admissionPaymentRouter,
  teacher: teacherRouter,
  house: houseRouter,
  room: roomRouter,
  batch: batchRouter,
  batchClass: batchClassRouter,
  teacherAdvance: teacherAdvanceRouter,
  housePayment: housePaymentRouter,
  utilityPayment: utilityPaymentRouter,
  otherPayment: otherPaymentRouter,
  teacherPayment: teacherPaymentRouter,
  report: reportRouter,
  studentAttendance: studentAttendanceRouter,
  homework: homeworkRouter,
  examCategory: examCategoryRouter,
  exam: examRouter,
  dashboard: dashboardRouter,
  examResult: examResultRouter,
  document: documentRouter,
  printTask: printTaskRouter,
  todo: todoRouter,
  user: userRouter,
  role: roleRouter,
  permission: permissionRouter,
  rbac: rbacRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
