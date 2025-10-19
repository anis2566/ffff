"use client";

import { Edit, RefreshCcw, Trash2 } from "lucide-react";

import { TeacherPayment } from "@workspace/db";
import { ListActions } from "@workspace/ui/shared/list-actions";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { TEACHER_ADVANCE_STATUS } from "@workspace/utils/constant";

import { ListActionButton } from "@/components/list-action-button";
import { ListActionLink } from "@/components/list-action-link";
import {
  useDeleteTeacherPayment,
  useTeacherPaymentStatus,
} from "@/hooks/use-teacher-payment";

interface TeacherPaymentListProps {
  payments: TeacherPayment[];
}

export const PaymentsList = ({ payments }: TeacherPaymentListProps) => {
  const { onOpen } = useDeleteTeacherPayment();
  const { onOpen: onOpenStatus } = useTeacherPaymentStatus();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>#ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Rate</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Incentive</TableHead>
          <TableHead>D. Unit</TableHead>
          <TableHead>Deduction</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Advance</TableHead>
          <TableHead>Net Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.teacherIndex}</TableCell>
            <TableCell>{payment.teacherName}</TableCell>
            <TableCell>{payment.month}</TableCell>
            <TableCell>Rate</TableCell>
            <TableCell>{payment.classUnit}</TableCell>
            <TableCell>{payment.incentive || 0}</TableCell>
            <TableCell>{payment.deductionUnit || 0}</TableCell>
            <TableCell>{payment.deduction || 0}</TableCell>
            <TableCell>{payment.amount || 0}</TableCell>
            <TableCell>{0}</TableCell>
            <TableCell>{payment.netAmount || 0}</TableCell>
            <TableCell>
              <Badge
                variant={
                  payment.status === TEACHER_ADVANCE_STATUS.Pending
                    ? "outline"
                    : payment.status === TEACHER_ADVANCE_STATUS.Approved
                      ? "default"
                      : "destructive"
                }
                className="rounded-full"
              >
                {payment.status}
              </Badge>
            </TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="Edit"
                  href={`/expense/teacher/edit/${payment.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  title="Change Status"
                  icon={RefreshCcw}
                  onClick={() => onOpenStatus(payment.id, payment.status)}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(payment.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
