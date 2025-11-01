"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SalaryPaymentForm } from "../form/salary-payment-form";
import { SalaryStudentProfile } from "../components/salary-student-profile";

interface SalaryPaymentViewProps {
  id: string;
}

export const SalaryPaymentView = ({ id }: SalaryPaymentViewProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.salaryPayment.getOne.queryOptions({ id })
  );

  return (
    <div className="space-y-6">
      <SalaryStudentProfile student={data.student} month={data.month} />
      <SalaryPaymentForm id={id} amount={data.amount} status={data.status} />
    </div>
  );
};
