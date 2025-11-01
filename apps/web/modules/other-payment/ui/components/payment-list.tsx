"use client";

import { ListActionButton } from "@/components/list-action-button";
import { useEditIncome } from "@/hooks/use-other-income";
import { usePermissions } from "@/hooks/use-user-permission";
import { OtherPayment } from "@workspace/db";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { ListActions } from "@workspace/ui/shared/list-actions";
import { Edit } from "lucide-react";

interface OtherPaymentListProps {
  payments: OtherPayment[];
}

export const PaymentList = ({ payments }: OtherPaymentListProps) => {
  const { hasPermission } = usePermissions();
  const { onOpen: onEdit } = useEditIncome();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Updated By</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id} className="even:bg-muted">
            <TableCell>{payment.name}</TableCell>
            <TableCell>{payment.amount}</TableCell>
            <TableCell>{payment.month}</TableCell>
            <TableCell>{payment.session}</TableCell>
            <TableCell>{payment.updatedBy ?? "-"}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      payment.id,
                      payment.session,
                      payment.month,
                      payment.name,
                      payment.amount.toString()
                    )
                  }
                  hasPermission={hasPermission("income", "update")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
