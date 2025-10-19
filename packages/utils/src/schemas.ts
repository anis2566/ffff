import { z } from "zod";

const requiredString = z.string().min(1, { message: "required" });

export const SignUpSchema = z.object({
  name: requiredString,
  email: requiredString,
  password: z.string().min(6, { message: "invalid password" }),
});

export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const SignInSchema = z.object({
  email: requiredString,
  password: requiredString,
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const ClassNameSchema = z.object({
  name: requiredString,
  level: requiredString,
  position: requiredString,
});

export type ClassNameSchemaType = z.infer<typeof ClassNameSchema>;

export const SubjectSchema = z.object({
  name: requiredString,
  level: requiredString,
  group: z.string().optional(),
});

export type SubjectSchemaType = z.infer<typeof SubjectSchema>;

export const CounterSchema = z.object({
  type: requiredString,
  value: requiredString,
});

export type CounterSchemaType = z.infer<typeof CounterSchema>;

export const AdmissionFeeSchema = z.object({
  classNameId: requiredString,
  amount: requiredString,
});

export type AdmissionFeeSchemaType = z.infer<typeof AdmissionFeeSchema>;

export const SalaryFeeSchema = z.object({
  type: requiredString,
  classNameId: requiredString,
  amount: requiredString,
  group: z.string().optional(),
});

export type SalaryFeeSchemaType = z.infer<typeof SalaryFeeSchema>;

export const InstituteSchema = z.object({
  type: requiredString,
  name: requiredString,
});

export type InstituteSchemaType = z.infer<typeof InstituteSchema>;

export const StudentSchema = z.object({
  name: requiredString,
  nameBangla: requiredString,
  fName: requiredString,
  mName: requiredString,
  gender: requiredString,
  dob: requiredString,
  nationality: requiredString,
  religion: requiredString,
  imageUrl: z.string().optional(),
  school: requiredString,
  classNameId: requiredString,
  section: z.string().optional(),
  shift: z.string().optional(),
  group: z.string().optional(),
  roll: requiredString,
  fPhone: z.string().length(11, { message: "invalid phone number" }),
  mPhone: z.string().length(11, { message: "invalid phone number" }),
  presentHouseNo: requiredString,
  presentMoholla: requiredString,
  presentPost: requiredString,
  presentThana: requiredString,
  permanentVillage: requiredString,
  permanentPost: requiredString,
  permanentThana: requiredString,
  permanentDistrict: requiredString,
  type: requiredString,
  studentId: requiredString,
  admissionFee: requiredString,
  salaryFee: requiredString,
  courseFee: z.string().optional(),
  batchId: requiredString,
});
export type StudentSchemaType = z.infer<typeof StudentSchema>;

export const FindStudentSchema = z.object({
  classNameId: requiredString,
  search: requiredString,
});

export type FindStudentSchemaType = z.infer<typeof FindStudentSchema>;

export const SalaryPaymentSchema = z.object({
  method: requiredString,
  amount: requiredString,
  note: z.string().optional(),
});

export type SalaryPaymentSchemaType = z.infer<typeof SalaryPaymentSchema>;

export const TeacherSchema = z.object({
  name: requiredString,
  fName: requiredString,
  mName: requiredString,
  gender: requiredString,
  dob: requiredString,
  nationality: requiredString,
  religion: requiredString,
  imageUrl: z.string().optional(),
  presentHouseNo: requiredString,
  presentMoholla: requiredString,
  presentPost: requiredString,
  presentThana: requiredString,
  permanentVillage: requiredString,
  permanentPost: requiredString,
  permanentThana: requiredString,
  permanentDistrict: requiredString,
  phone: z.string().length(11, { message: "invalid phone number" }),
  altPhone: z.string().optional(),
  currentInstitution: requiredString,
  currentSubject: requiredString,
  level: z.array(z.string()).min(1, { message: "required" }),
  availableTimes: z.array(z.string()).min(1, { message: "required" }),
  availableDays: z.array(z.string()).min(1, { message: "required" }),
  classRate: requiredString,
  teacherId: requiredString,
});
export type TeacherSchemaType = z.infer<typeof TeacherSchema>;

export const HouseSchema = z.object({
  name: requiredString,
  roomCount: requiredString,
});
export type HouseSchemaType = z.infer<typeof HouseSchema>;

export const RoomSchema = z.object({
  name: requiredString,
  capacity: requiredString,
  availableTimes: z.array(z.string()).min(1, { message: "required" }),
  houseId: requiredString,
});
export type RoomSchemaType = z.infer<typeof RoomSchema>;

export const BatchSchema = z.object({
  name: requiredString,
  classNameId: requiredString,
  capacity: requiredString,
  time: z.array(z.string()).min(1, { message: "required" }),
  classTime: z.array(z.string()).min(1, { message: "required" }),
  level: requiredString,
  roomId: requiredString,
});
export type BatchSchemaType = z.infer<typeof BatchSchema>;

export const BatchClassSchema = z.object({
  time: requiredString,
  days: z.array(z.string()).min(1, { message: "required" }),
  subjectId: requiredString,
  teacherId: requiredString,
  batchId: requiredString,
});
export type BatchClassSchemaType = z.infer<typeof BatchClassSchema>;

export const TeacherAdvanceSchema = z.object({
  teacherId: requiredString,
  amount: requiredString,
});
export type TeacherAdvanceSchemaType = z.infer<typeof TeacherAdvanceSchema>;

export const TeacherAdvanceStatusSchema = z.object({
  status: requiredString,
});
export type TeacherAdvanceStatusSchemaType = z.infer<
  typeof TeacherAdvanceStatusSchema
>;

export const HousePaymentSchema = z.object({
  month: requiredString,
  amount: requiredString,
  method: requiredString,
  paymentStatus: requiredString,
  houseId: requiredString,
});
export type HousePaymentSchemaType = z.infer<typeof HousePaymentSchema>;

export const UtilityPaymentSchema = z.object({
  name: requiredString,
  amount: requiredString,
});
export type UtilityPaymentSchemaType = z.infer<typeof UtilityPaymentSchema>;

export const OtherPayment = z.object({
  name: requiredString,
  amount: requiredString,
});
export type OtherPaymentType = z.infer<typeof OtherPayment>;

export const TeacherPaymentSchema = z.object({
  teacherId: requiredString,
  month: requiredString,
  classUnit: requiredString,
  incentive: z.string().optional(),
  deductionUnit: z.string().optional(),
  note: z.string().optional(),
});
export type TeacherPaymentSchemaType = z.infer<typeof TeacherPaymentSchema>;

export const AdmissionPaymentStatusSchema = z.object({
  method: requiredString,
  paymentStatus: requiredString,
});
export type AdmissionPaymentStatusSchemaType = z.infer<
  typeof TeacherAdvanceStatusSchema
>;

const AttendanceStatusSchema = z.object({
  studentId: requiredString,
  status: requiredString,
});

export const AttendanceSchema = z.object({
  batchId: requiredString,
  date: requiredString,
  attendances: z.array(AttendanceStatusSchema).min(1, { message: "required" }),
});

export type AttendanceSchemaType = z.infer<typeof AttendanceSchema>;

export const HomeworkStudentSchema = z.object({
  studentId: requiredString,
});

export const HomeworkSchema = z.object({
  date: requiredString,
  subjectId: requiredString,
  batchId: requiredString,
  classNameId: requiredString,
});

export type HomeworkSchemaType = z.infer<typeof HomeworkSchema>;

export const ExamCategory = z.object({
  name: requiredString,
});

export type ExamCategoryType = z.infer<typeof ExamCategory>;

export const ExamSchema = z
  .object({
    name: requiredString,
    topic: requiredString,
    subjectId: requiredString,
    batchId: requiredString,
    classNameId: requiredString,
    examCategoryId: requiredString,
    date: requiredString,
    cq: z.string().optional(),
    mcq: z.string().optional(),
    written: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.cq && !data.mcq && !data.written) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of cq, mcq, or written is required",
        path: ["cq"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of cq, mcq, or written is required",
        path: ["mcq"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one of cq, mcq, or written is required",
        path: ["written"],
      });
    }
  });

export type ExamSchemaType = z.infer<typeof ExamSchema>;

export const DocumentSchema = z.object({
  type: requiredString,
  name: requiredString,
  deliveryDate: requiredString,
  noOfCopy: requiredString,
  classNameId: requiredString,
  subjectId: requiredString,
  userId: requiredString,
});

export type DocumentSchemaType = z.infer<typeof DocumentSchema>;

export const TodoSchema = z.object({
  text: requiredString,
});

export type TodoSchemaType = z.infer<typeof TodoSchema>;

export const RoleSchema = z.object({
  name: requiredString,
  description: z.string().optional(),
});

export type RoleSchemaType = z.infer<typeof RoleSchema>;

export const PermissionSchema = z.object({
  module: requiredString,
  actions: z.array(z.string()).min(1, { message: "required" }),
});

export type PermissionSchemaType = z.infer<typeof PermissionSchema>;
