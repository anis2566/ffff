"use client";

import Link from "next/link";

import { AdmissionPayment } from "@workspace/db";
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
import { cn } from "@workspace/ui/lib/utils";

import { ADMISSION_PAYMENT_STATUS } from "@workspace/utils/constant";
import { usePermissions } from "@/hooks/use-user-permission";

interface DueAdmissionPaymentWithRelation extends AdmissionPayment {
  student: {
    name: string;
    imageUrl: string | null;
    studentId: number;
    className: {
      name: string;
    };
  };
}

interface AdmissionPaymentListProps {
  payments: DueAdmissionPaymentWithRelation[];
}

export const DueAdmissionPaymentList = ({
  payments,
}: AdmissionPaymentListProps) => {
  const { hasPermission } = usePermissions();
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Student</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>P. Status</TableHead>
          <TableHead>Action</TableHead>
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
            <TableCell>{payment.amount}</TableCell>
            <TableCell>{payment.method}</TableCell>
            <TableCell>
              <Badge
                variant={
                  payment.paymentStatus === ADMISSION_PAYMENT_STATUS.Unpaid
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
                variant="outline"
                size="sm"
                className={cn(
                  "hidden max-w-fit rounded-full",
                  payment.paymentStatus === ADMISSION_PAYMENT_STATUS.Unpaid &&
                    "flex",
                  hasPermission("admission_payment", "update") && "flex"
                )}
              >
                <Link href={`/fee/admission/${payment.id}`} prefetch>
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
