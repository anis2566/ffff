"use client";

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

import { ADMISSION_PAYMENT_STATUS } from "@workspace/utils/constant";
import { usePermissions } from "@/hooks/use-user-permission";
import { ListActions } from "@workspace/ui/shared/list-actions";
import { ListActionLink } from "@/components/list-action-link";
import { Edit, HandCoins } from "lucide-react";

interface AdmissionPaymentWithRelation extends AdmissionPayment {
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
  payments: AdmissionPaymentWithRelation[];
}

export const AdmissionPaymentList = ({
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
          <TableHead>P. Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>P. Status</TableHead>
          <TableHead>Updated By</TableHead>
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
            <TableCell>{payment.paidAmount || 0}</TableCell>
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
            <TableCell>{payment.updatedBy}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="Pay Now"
                  href={`/fee/admission/${payment.id}`}
                  icon={HandCoins}
                  hasPermission={hasPermission("admission_payment", "update")}
                  className={
                    payment.paymentStatus !== ADMISSION_PAYMENT_STATUS.Unpaid
                      ? "hidden"
                      : ""
                  }
                />
                <ListActionLink
                  title="Edit"
                  href={`/fee/admission/edit/${payment.id}`}
                  icon={Edit}
                  hasPermission={hasPermission("admission_payment", "update")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
