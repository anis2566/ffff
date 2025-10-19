"use client";

import { format } from "date-fns";

import { HousePayment } from "@workspace/db";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";

interface HousePaymentListProps {
  payments: HousePayment[];
}

export const PaymentList = ({ payments }: HousePaymentListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>H. Name</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>{payment.houseName}</TableCell>
            <TableCell>{payment.session}</TableCell>
            <TableCell>{payment.month}</TableCell>
            <TableCell>
              {format(payment.createdAt, "dd MMM yyyy hh:mm a")}
            </TableCell>
            <TableCell>{payment.amount}</TableCell>
            <TableCell>
              <Badge variant="secondary">{payment.method}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  payment.paymentStatus === "Unpaid" ? "destructive" : "default"
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
