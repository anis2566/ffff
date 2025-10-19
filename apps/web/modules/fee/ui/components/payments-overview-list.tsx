"use client";

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
import { MONTH, SALARY_PAYMENT_STATUS } from "@workspace/utils/constant";

import { cn } from "@workspace/ui/lib/utils";

type StudentWithRelations = {
  className: {
    name: string;
  };
  id: string;
  name: string;
  studentId: number;
  imageUrl: string | null;
  salaryPayments: {
    status: string;
    id: string;
    paymentStatus: string;
    month: string;
    amount: number;
  }[];
};

interface PaymentOverviewListProps {
  students: StudentWithRelations[];
}

export const PaymentOverviewList = ({ students }: PaymentOverviewListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>#ID</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          {Object.values(MONTH).map((month) => (
            <TableHead key={month}>{month}</TableHead>
          ))}
          <TableHead>Due</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.studentId}</TableCell>
            <TableCell>
              <Avatar>
                <AvatarImage src={student.imageUrl || ""} />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>{student.name}</TableCell>
            <TableCell>{student.className.name}</TableCell>
            {Object.values(MONTH).map((month, index) => {
              const payment = student.salaryPayments.find(
                (payment) => payment.month === month
              );
              return (
                <TableCell key={index} className="text-center py-1">
                  <Badge
                    variant={
                      payment?.status === SALARY_PAYMENT_STATUS["N/A"]
                        ? "secondary"
                        : payment?.paymentStatus === SALARY_PAYMENT_STATUS.Paid
                          ? "default"
                          : payment?.paymentStatus ===
                              SALARY_PAYMENT_STATUS.Unpaid
                            ? "destructive"
                            : "outline"
                    }
                    className={cn(
                      "",
                      payment?.paymentStatus === SALARY_PAYMENT_STATUS.Paid &&
                        "rounded-full",
                      payment?.paymentStatus === SALARY_PAYMENT_STATUS.Unpaid &&
                        "rounded-full"
                    )}
                  >
                    {payment?.paymentStatus === SALARY_PAYMENT_STATUS.Paid
                      ? payment?.amount
                      : payment?.paymentStatus === SALARY_PAYMENT_STATUS.Unpaid
                        ? payment?.paymentStatus
                        : payment?.status}
                  </Badge>
                </TableCell>
              );
            })}
            <TableCell>
              {
                student.salaryPayments.filter(
                  (item) => item.paymentStatus === SALARY_PAYMENT_STATUS.Unpaid
                ).length
              }{" "}
              Months
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
