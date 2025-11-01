"use client";

import Link from "next/link";

import { SalaryPayment } from "@workspace/db";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Button } from "@workspace/ui/components/button";

import { SALARY_PAYMENT_STATUS } from "@workspace/utils/constant";
import { usePermissions } from "@/hooks/use-user-permission";
import { cn } from "@workspace/ui/lib/utils";

interface SalaryPaymentWithRelation extends SalaryPayment {
  student: {
    name: string;
    imageUrl: string | null;
    studentId: number;
    className: {
      name: string;
    };
  };
}

interface DuePaymentListProps {
  payments: SalaryPaymentWithRelation[];
}

export const DuePaymentList = ({ payments }: DuePaymentListProps) => {
  const { hasPermission } = usePermissions();
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Student</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>P. Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id} className="even:bg-muted">
            <TableCell className="flex items-center gap-x-2">
              <Avatar>
                <AvatarImage src={payment.student.imageUrl || ""} />
                <AvatarFallback>
                  {payment.student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">
                  {payment.student.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  #{payment.student.studentId}
                </p>
              </div>
            </TableCell>
            <TableCell>{payment.student.className.name}</TableCell>
            <TableCell>{payment.month}</TableCell>
            <TableCell>{payment.amount}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="rounded-xs">
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
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/fee/salary/${payment.id}`}
                  className={cn(
                    "",
                    hasPermission("salary_payment", "update")
                      ? "flex"
                      : "hidden"
                  )}
                >
                  Pay now
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
