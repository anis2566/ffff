import { SalaryPayment } from "@workspace/db";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";

interface SalaryPaymentWithRelation extends SalaryPayment {
  student: {
    name: string;
    studentId: number;
    className: {
      name: string;
    }
  };
}

interface SalaryPaymentListProps {
  payments: SalaryPaymentWithRelation[];
}

export const RecentSalaries = ({ payments }: SalaryPaymentListProps) => {
  return (
    <ListCardWrapper title="Recent Salaries">
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>#ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.student.studentId}</TableCell>
              <TableCell>{payment.student.name}</TableCell>
              <TableCell>{payment.student.className}</TableCell>
              <TableCell>{payment.month}</TableCell>
              <TableCell>{payment.amount}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    payment.paymentStatus === "Unpaid"
                      ? "destructive"
                      : "default"
                  }
                >
                  {payment.paymentStatus}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ListCardWrapper>
  );
};
