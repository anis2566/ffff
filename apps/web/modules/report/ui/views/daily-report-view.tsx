"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { useGetDailyReports } from "../../filters/use-get-daily-reports";
import { FilterDaily } from "../components/filter-daily";

export const DailyReportView = () => {
  const trpc = useTRPC();
  const [filters] = useGetDailyReports();

  const { data } = useSuspenseQuery(
    trpc.report.daily.queryOptions({ ...filters })
  );

  const totalIncome =
    (data?.dailySalary._sum.amount ?? 0) +
    (data?.dailyAdmission._sum.amount ?? 0) +
    (data?.dailyOthers._sum.amount ?? 0);
  const totalExpense =
    (data?.dailyHouseRent._sum.amount ?? 0) +
    (data?.dailyUtility._sum.amount ?? 0) +
    (data?.dailyTeacherAdvance._sum.amount ?? 0);
  const netBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-8">
      <CardWrapper
        title="Income Report"
        description="This report shows the income of a specific day."
      >
        <FilterDaily />
        <Table>
          <TableHeader>
            <TableRow className="bg-background/60">
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Unit</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Total Salary</TableCell>
              <TableCell className="text-right">
                {data?.dailySalary._count._all}
              </TableCell>
              <TableCell className="text-right">
                {data?.dailySalary._sum.amount || 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Admission</TableCell>
              <TableCell className="text-right">
                {data?.dailyAdmission._count._all}
              </TableCell>
              <TableCell className="text-right">
                {data?.dailyAdmission._sum.amount || 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Others</TableCell>
              <TableCell className="text-right">
                {data?.dailyOthers._count._all}
              </TableCell>
              <TableCell className="text-right">
                {data?.dailyOthers._sum.amount || 0}
              </TableCell>
            </TableRow>
            <TableRow className="bg-background/80">
              <TableCell colSpan={2} className="font-bold">
                Total Income
              </TableCell>
              <TableCell className="font-bold text-right">
                {totalIncome}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardWrapper>

      <CardWrapper
        title="Expense Report"
        description="This report shows the expense of a specific day."
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-background/60">
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Unit</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Total House Rent</TableCell>
              <TableCell className="text-right">
                {data?.dailyHouseRent._count._all}
              </TableCell>
              <TableCell className="text-right">
                {data?.dailyHouseRent._sum.amount || 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Utility</TableCell>
              <TableCell className="text-right">
                {data?.dailyUtility._count._all}
              </TableCell>
              <TableCell className="text-right">
                {data?.dailyUtility._sum.amount || 0}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Total Teacher Advance</TableCell>
              <TableCell className="text-right">
                {data?.dailyTeacherAdvance._count._all}
              </TableCell>
              <TableCell className="text-right">
                {data?.dailyTeacherAdvance._sum.amount || 0}
              </TableCell>
            </TableRow>
            <TableRow className="bg-background/80">
              <TableCell colSpan={2} className="font-bold">
                Total Expense
              </TableCell>
              <TableCell className="font-bold text-right">
                {totalExpense}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardWrapper>

      <CardWrapper
        title="Overall Report"
        description="This report shows the overall report of a specific day."
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-background/60">
              <TableHead>Type</TableHead>
              <TableHead></TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={2}>Total Income</TableCell>
              <TableCell className="text-right">{totalIncome}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>Total Expense</TableCell>
              <TableCell className="text-right">{totalExpense}</TableCell>
            </TableRow>
            <TableRow className="bg-background/80">
              <TableCell colSpan={2} className="font-bold">
                Net Balance
              </TableCell>
              <TableCell className="font-bold text-right">
                {netBalance}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardWrapper>
    </div>
  );
};
