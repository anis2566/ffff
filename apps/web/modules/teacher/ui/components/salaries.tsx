"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { TEACHER_PAYMENT_STATUS } from "@workspace/utils/constant";
import { Badge } from "@workspace/ui/components/badge";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetPayments } from "../../filters/use-get-payments";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2 } from "lucide-react";

interface SalariesProps {
  teacherId: string;
}

export const Salaries = ({ teacherId }: SalariesProps) => {
  const trpc = useTRPC();
  const [filter, setFilter] = useGetPayments();

  const { data, isLoading } = useQuery(
    trpc.teacherPayment.getByTeacher.queryOptions({
      teacherId,
      page: filter.page,
    })
  );

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs w-full overflow-hidden h-full">
      <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden h-full">
        <CardContent className="p-0 flex flex-col gap-y-3 w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-background/60">
                <TableHead>Month</TableHead>
                <TableHead>Class Rate</TableHead>
                <TableHead>Class Unit</TableHead>
                <TableHead>Incentive</TableHead>
                <TableHead>Deduction Unit</TableHead>
                <TableHead>Deduction</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Advance</TableHead>
                <TableHead>Net Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.payments?.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="max-w-[200px] truncate">
                    {payment.month}
                  </TableCell>
                  <TableCell>{payment.teacher.classRate}</TableCell>
                  <TableCell>{payment.classUnit}</TableCell>
                  <TableCell>{payment.incentive || 0}</TableCell>
                  <TableCell>{payment.deductionUnit || 0}</TableCell>
                  <TableCell>{payment.deduction || 0}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>{payment.advance}</TableCell>
                  <TableCell>{payment.netAmount}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-white rounded-full",
                        payment.status === TEACHER_PAYMENT_STATUS.Pending &&
                          "bg-indigo-500",
                        payment.status === TEACHER_PAYMENT_STATUS.Confirmed &&
                          "bg-amber-500",
                        payment.status === TEACHER_PAYMENT_STATUS.Paid &&
                          "bg-green-500",
                        payment.status === TEACHER_PAYMENT_STATUS.Rejected &&
                          "bg-rose-500"
                      )}
                    >
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <DesktopPagination
            totalCount={data?.totalCount || 0}
            currentPage={filter.page}
            pageSize={5}
            onPageChange={(page) => setFilter({ page })}
          />
          <MobilePagination
            totalCount={data?.totalCount || 0}
            currentPage={filter.page}
            pageSize={5}
            onPageChange={(page) => setFilter({ page })}
          />
        </CardContent>
      </Card>
    </div>
  );
};
