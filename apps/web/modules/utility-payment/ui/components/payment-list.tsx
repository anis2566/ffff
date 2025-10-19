"use client";

import { UtilityPayment } from "@workspace/db";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";

interface UtilityPaymentListProps {
  payments: UtilityPayment[];
}

export const PaymentList = ({ payments }: UtilityPaymentListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Month</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.name}</TableCell>
            <TableCell>{payment.amount}</TableCell>
            <TableCell>{payment.session}</TableCell>
            <TableCell>{payment.month}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
