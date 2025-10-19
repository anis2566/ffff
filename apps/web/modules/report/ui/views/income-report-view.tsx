"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { MONTH } from "@workspace/utils/constant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { useGetSession } from "../../filters/use-get-session";
import { Filter } from "../components/filter";

export const IncomeReportView = () => {
  const trpc = useTRPC();
  const [filters] = useGetSession();

  const { data } = useSuspenseQuery(
    trpc.report.income.queryOptions({ ...filters })
  );

  const totalSalary =
    data?.salaries.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;
  const totalAdmission =
    data?.admissions.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;
  const totalOthers =
    data?.others.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;

  const getTotalForMonth = (month: MONTH): number => {
    if (!data) return 0;

    return (
      (data.salaries
        ?.filter((item) => item.month === month)
        .reduce((total, item) => total + (item.amount || 0), 0) || 0) +
      (data.admissions
        ?.filter((item) => item.month === month)
        .reduce((total, item) => total + (item.amount || 0), 0) || 0) +
      (data.others
        ?.filter((item) => item.month === month)
        .reduce((total, item) => total + (item.amount || 0), 0) || 0)
    );
  };

  return (
    <CardWrapper
      title="Overview"
      description="This is the income overview for the current session."
    >
      <Filter />
      <Table>
        <TableHeader>
          <TableRow className="bg-background/80">
            <TableHead>Income Type</TableHead>
            {Object.values(MONTH).map((month) => (
              <TableHead key={month}>{month}</TableHead>
            ))}
            <TableHead>Sub Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Salary</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.salaries.find(
                (salary) => salary.month === month
              );
              return (
                <TableCell key={month}>{monthData?.amount || 0}</TableCell>
              );
            })}
            <TableCell>{totalSalary}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Admission</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.admissions.find(
                (admission) => admission.month === month
              );
              return (
                <TableCell key={month}>{monthData?.amount || 0}</TableCell>
              );
            })}
            <TableCell>{totalAdmission}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Others</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.others.find(
                (other) => other.month === month
              );
              return (
                <TableCell key={month}>{monthData?.amount || 0}</TableCell>
              );
            })}
            <TableCell>{totalOthers}</TableCell>
          </TableRow>
          <TableRow className="bg-background/80">
            <TableCell className="font-bold">Total</TableCell>
            {Object.values(MONTH).map((month) => (
              <TableCell key={month} className="font-bold">
                {getTotalForMonth(month)}
              </TableCell>
            ))}
            <TableCell className="font-bold">
              {totalSalary + totalAdmission + totalOthers}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardWrapper>
  );
};
