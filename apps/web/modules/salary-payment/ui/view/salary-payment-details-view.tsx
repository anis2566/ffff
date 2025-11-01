"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { DollarSign, User } from "lucide-react";
import { Separator } from "@workspace/ui/components/separator";
import { format } from "date-fns";

interface SalaryPaymentDetialsViewProps {
  id: string;
}

export const SalaryPaymentDetialsView = ({
  id,
}: SalaryPaymentDetialsViewProps) => {
  const trpc = useTRPC();

  const { data: payment } = useQuery(
    trpc.salaryPayment.getOne.queryOptions({ id })
  );
  return (
    <div className="space-y-6">
      <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src={payment?.student?.imageUrl || ""} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {payment?.student?.name
                  .split(" ")
                  .map((name) => name.charAt(0))
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div>
                <CardTitle className="text-xl font-bold">
                  {payment?.student?.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  Student ID: {payment?.student?.studentId} • Class:{" "}
                  {payment?.student?.className?.name}
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="outline" className="px-3 py-1">
                  <DollarSign className="w-3 h-3" /> ৳ {payment?.amount} / month
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <CardWrapper
        title="Payment Details"
        description={payment?.transactionId?.toUpperCase()}
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Session</span>
            <span className="text-base">{payment?.session}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Month</span>
            <span className="text-base">{payment?.month}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <span className="text-base">{payment?.amount}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Paid Amount</span>
            <span className="text-base">{payment?.paidAmount || 0}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Paid At</span>
            <span className="text-base">
              {format(payment?.paidAt || new Date(), "dd MMM yyyy, hh:mm a")}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Updated by</span>
            <span className="text-base">{payment?.updatedBy}</span>
          </div>

          {payment?.note && (
            <div className="space-y-2 border border-muted rounded-md p-3">
              <p className="text-base text-muted-foreground text-center font-bold">Note</p>
              <p className="text-base">{payment?.note}</p>
            </div>
          )}
        </div>
      </CardWrapper>
    </div>
  );
};
