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
import { MONTH } from "@workspace/utils/constant";
import { useGetSession } from "../../filters/use-get-session";
import { Filter } from "../components/filter";

export const HouseExpenseReportView = () => {
  const trpc = useTRPC();
  const [filters] = useGetSession()

  const { data } = useSuspenseQuery(
    trpc.report.houseExpense.queryOptions({ ...filters })
  );

  const getTotalForMonth = (month: MONTH): number => {
    return (
      data?.houses.reduce((total, item) => {
        const monthData = item.months.find((m) => m.month === month);
        return total + (monthData?.amount ?? 0);
      }, 0) ?? 0
    );
  };

  return (
    <CardWrapper title="House" description="House expense report">
      <Filter />
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>Name</TableHead>
            {Object.values(MONTH).map((month, index) => (
              <TableHead key={index}>{month}</TableHead>
            ))}
            <TableHead>Sub Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.houses.map((houses, index) => (
            <TableRow key={index}>
              <TableCell>{houses.houseName}</TableCell>
              {Object.values(MONTH).map((month, index) => {
                const monthData = houses.months.find((m) => m.month === month);
                return (
                  <TableCell key={index}>
                    {monthData ? monthData.amount : 0}
                  </TableCell>
                );
              })}
              <TableCell>
                {houses.months.reduce((acc, curr) => acc + curr.amount, 0)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-background/80">
            <TableCell className="font-bold">Total</TableCell>
            {Object.values(MONTH).map((month, index) => {
              return (
                <TableCell key={index} className="font-bold">
                  {getTotalForMonth(month)}
                </TableCell>
              );
            })}
            <TableCell className="font-bold">{data?.totalPayment}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardWrapper>
  );
};
