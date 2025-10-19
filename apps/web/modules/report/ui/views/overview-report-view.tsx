"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { MONTH } from "@workspace/utils/constant";
import { cn } from "@workspace/ui/lib/utils";
import { useGetSession } from "../../filters/use-get-session";
import { Filter } from "../components/filter";

export const OverviewReportView = () => {
  const trpc = useTRPC();
  const [filters] = useGetSession();

  const { data } = useSuspenseQuery(
    trpc.report.overview.queryOptions({ ...filters })
  );

  return (
    <CardWrapper
      title="Final Report"
      description="This is the final report for the current session."
    >
      <Filter />
      <Table>
        <TableHeader>
          <TableRow className="bg-accent hover:bg-accent/80">
            <TableHead>Type</TableHead>
            {Object.values(MONTH).map((month) => (
              <TableHead key={month}>{month}</TableHead>
            ))}
            <TableHead>Sub Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Income</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.totalIncomeData.find(
                (income) => income.month === month
              );
              return <TableCell key={month}>{monthData?.total || 0}</TableCell>;
            })}
            <TableCell className="font-bold">{data?.totalIncome}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Expense</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.totalExpenseData.find(
                (expense) => expense.month === month
              );
              return <TableCell key={month}>{monthData?.total || 0}</TableCell>;
            })}
            <TableCell className="font-bold">{data?.totalExpense}</TableCell>
          </TableRow>
          <TableRow className="bg-accent hover:bg-accent/80">
            <TableCell className="font-bold">Profit</TableCell>
            {Object.values(MONTH).map((month) => {
              const monthData = data?.totalProfitData.find(
                (profit) => profit.month === month
              );
              return (
                <TableCell
                  key={month}
                  className={cn(
                    "font-bold",
                    monthData?.total || 0 < 0
                      ? "text-red-500"
                      : "text-green-500"
                  )}
                >
                  {monthData?.total || 0}
                </TableCell>
              );
            })}
            <TableCell
              className={cn(
                "font-bold",
                data?.totalProfit || 0 < 0 ? "text-red-500" : "text-green-500"
              )}
            >
              {data?.totalProfit}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardWrapper>
  );
};
