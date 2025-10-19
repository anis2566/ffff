"use client";

import { useState } from "react";

import { NewSalaryForm } from "../form/new-salary-form";
import { MonthList } from "../components/month-list";
import { StudentProfile } from "../components/student-profile";

export type Student = {
  name: string;
  imageUrl: string | null;
  studentId: number;
  salaryFee: number;
  className: {
    name: string;
  };
  salaryPayments: {
    id: string;
    status: string;
    paymentStatus: string;
    amount: number;
    month: string;
  }[];
} | null;

export const NewSalaryView = () => {
  const [student, setStudent] = useState<Student>(null);

  return (
    <div className="space-y-6">
      <NewSalaryForm setStudent={setStudent} student={student} />
      <StudentProfile student={student || null} />
      <MonthList payments={student?.salaryPayments || null} />
    </div>
  );
};
