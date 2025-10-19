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

export const ExpenseReportView = () => {
  const trpc = useTRPC();
  const [filters] = useGetSession()

  const { data } = useSuspenseQuery(
    trpc.report.expense.queryOptions({ ...filters })
  );

  const totalTeacher =
    data?.teachers.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;
  const totalHouse =
    data?.houses.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;
  const totalUtility =
    data?.utilities.reduce((acc, curr) => acc + (curr.amount || 0), 0) ?? 0;

  const getTotalForMonth = (month: MONTH): number => {
    if (!data) return 0;

    return (
      (data.teachers
        ?.filter((item) => item.month === month)
        .reduce((total, item) => total + (item.amount || 0), 0) || 0) +
      (data.houses
        ?.filter((item) => item.month === month)
        .reduce((total, item) => total + (item.amount || 0), 0) || 0) +
      (data.utilities
        ?.filter((item) => item.month === month)
        .reduce((total, item) => total + (item.amount || 0), 0) || 0)
    );
  };

  return (
    <CardWrapper title="Overview" description="Expense overview">
      <Filter />
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>Expense Type</TableHead>
            {Object.values(MONTH).map((month) => (
              <TableHead key={month}>{month}</TableHead>
            ))}
            <TableHead>Sub Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Teacher</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.teachers.find(
                (teacher) => teacher.month === month
              );
              return (
                <TableCell key={month}>{monthData?.amount || 0}</TableCell>
              );
            })}
            <TableCell>{totalTeacher}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>House</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.houses.find(
                (house) => house.month === month
              );
              return (
                <TableCell key={month}>{monthData?.amount || 0}</TableCell>
              );
            })}
            <TableCell>{totalHouse}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Utility</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.utilities.find(
                (utility) => utility.month === month
              );
              return (
                <TableCell key={month}>{monthData?.amount || 0}</TableCell>
              );
            })}
            <TableCell>{totalUtility}</TableCell>
          </TableRow>
          <TableRow className="bg-background/80">
            <TableCell className="font-bold">Total</TableCell>
            {Object.values(MONTH).map((month) => (
              <TableCell key={month} className="font-bold">
                {getTotalForMonth(month)}
              </TableCell>
            ))}
            <TableCell className="font-bold">
              {totalTeacher + totalHouse + totalUtility}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardWrapper>
  );
};
