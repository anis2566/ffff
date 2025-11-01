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
import { ListActions } from "@workspace/ui/shared/list-actions";
import { ListActionLink } from "@/components/list-action-link";
import { Edit, Eye } from "lucide-react";
import { usePermissions } from "@/hooks/use-user-permission";

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
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Transaction ID</TableHead>
          <TableHead>Student</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>P. Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Paid At</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>P. Status</TableHead>
          <TableHead>Updated By</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id} className="even:bg-muted">
            <TableCell>{payment.transactionId}</TableCell>
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
            <TableCell>{payment.paidAmount || 0}</TableCell>
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
            <TableCell>{payment.updatedBy}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/fee/salary/details/${payment.id}`}
                  icon={Eye}
                  hasPermission={hasPermission("salary_payment", "read")}
                />
                <ListActionLink
                  title="Edit"
                  href={`/fee/salary/edit/${payment.id}`}
                  icon={Edit}
                  hasPermission={hasPermission("salary_payment", "update")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
