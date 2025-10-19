"use client";

import { format } from "date-fns";

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

import {
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
} from "@workspace/utils/constant";

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

interface SalaryPaymentListProps {
  payments: SalaryPaymentWithRelation[];
}

export const PaymentList = ({ payments }: SalaryPaymentListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Transaction ID</TableHead>
          <TableHead>#ID</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Paid At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>P. Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.transactionId}</TableCell>
            <TableCell>{payment.student.studentId}</TableCell>
            <TableCell>
              <Avatar>
                <AvatarImage src={payment.student.imageUrl || ""} />
                <AvatarFallback>
                  {payment.student.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>{payment.student.name}</TableCell>
            <TableCell>{payment.student.className.name}</TableCell>
            <TableCell>{payment.month}</TableCell>
            <TableCell>{payment.amount}</TableCell>
            <TableCell>{payment.method}</TableCell>
            <TableCell>
              {format(payment.paidAt || new Date(), "dd MMM yyyy, hh:mm a")}
            </TableCell>
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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
