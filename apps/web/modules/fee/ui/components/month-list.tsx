import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

import {
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
} from "@workspace/utils/constant";

interface MonthListProps {
  payments:
    | {
        id: string;
        month: string;
        amount: number;
        status: string;
        paymentStatus: string;
      }[]
    | null;
}

export const MonthList = ({ payments }: MonthListProps) => {
  return (
    <Collapsible open={Boolean(payments)} className="mt-4">
      <CollapsibleContent>
        <CardWrapper>
          <Table>
            <TableHeader>
              <TableRow className="bg-background/60">
                <TableHead>#SL</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>P. Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.map((payment, index) => (
                <TableRow key={payment.month}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{payment.month}</TableCell>
                  <TableCell>{payment.amount}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === SALARY_STATUS.Absent
                          ? "destructive"
                          : "default"
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
                  <TableCell>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/fee/salary/${payment.id}`}>Pay now</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardWrapper>
      </CollapsibleContent>
    </Collapsible>
  );
};
