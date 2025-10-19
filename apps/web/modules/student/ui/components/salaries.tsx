"use client";

import Link from "next/link";
import { Download, Loader2 } from "lucide-react";
import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import {
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
} from "@workspace/utils/constant";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import { useGetSalaries } from "../../filters/use-get-salaries";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

interface SalariesProps {
  studentId: string;
}

export const Salaries = ({ studentId }: SalariesProps) => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetSalaries();

  const { data, isLoading } = useQuery(
    trpc.salaryPayment.getByStudent.queryOptions({ studentId, ...filters })
  );

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ListCardWrapper
      title="Salaries"
      value={data?.totalCount}
      actionButtons
      actionButtonText="Export to CSV"
      actionButtonVariant="secondary"
      actionButtonIcon={Download}
      onClickAction={() => {}}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>Month</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>P. Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.salaries?.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.month}</TableCell>
              <TableCell>{payment.amount}</TableCell>
              <TableCell>{payment.method}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    payment.status === SALARY_STATUS.Present
                      ? "secondary"
                      : "destructive"
                  }
                  className="rounded-xs"
                >
                  {payment.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    payment.paymentStatus === SALARY_PAYMENT_STATUS.Unpaid
                      ? "destructive"
                      : "default"
                  }
                  className="rounded-full"
                >
                  {payment.paymentStatus}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className={cn(
                    "hidden",
                    payment.paymentStatus === SALARY_PAYMENT_STATUS.Unpaid &&
                      "flex w-full max-w-fit"
                  )}
                >
                  <Link href={`/fee/salary/${payment.id}`}>Pay now</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DesktopPagination
        totalCount={data?.totalCount || 0}
        currentPage={filters.page}
        pageSize={5}
        onPageChange={(page) => setFilters({ page })}
      />
      <MobilePagination
        totalCount={data?.totalCount || 0}
        currentPage={filters.page}
        pageSize={5}
        onPageChange={(page) => setFilters({ page })}
      />
    </ListCardWrapper>
  );
};
