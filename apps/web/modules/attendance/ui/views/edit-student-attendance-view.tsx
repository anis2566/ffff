"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { UserRoundCheck, UserRoundX, UsersRound } from "lucide-react";

import { Badge } from "@workspace/ui/components/badge";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import EditStudentAttendanceForm from "../form/edit-student-attendance-form";

interface EditStudentAttendanceViewProps {
  id: string;
}

export const EditStudentAttendanceView = ({
  id,
}: EditStudentAttendanceViewProps) => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.studentAttendance.getOne.queryOptions(id)
  );

  return (
    <div className="space-y-6">
      <CardWrapper contentClassName="space-y-4">
        <div>
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="border-l-4 border-blue-500 pl-4 py-1">
                <p className="text-sm font-medium mb-1">Class</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {data?.className?.name}
                </p>
              </div>
              <div className="border-l-4 border-emerald-500 pl-4 py-1">
                <p className="text-sm font-medium mb-1">Batch</p>
                <p className="text-md font-semibold text-muted-foreground">
                  {data?.batch?.name}
                </p>
              </div>
              <div className="rounded-xl px-2 py-1 border border-muted bg-background">
                <p className="text-xs font-medium">Date</p>
                <p className="text-base font-semibold">
                  {format(new Date(data?.date || new Date()), "dd-MM-yyyy")}
                </p>
              </div>
              <div className="rounded-xl px-2 py-1 border border-muted bg-background">
                <p className="text-xs font-medium">Day</p>
                <p className="text-base font-semibold">{data?.day}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className={`px-3 py-1 font-medium rounded-full`}
          >
            <UsersRound className="w-3 h-3" />
            <span>Total</span>
            <span className="font-bold">{data?.total}</span>
          </Badge>
          <Badge
            variant="secondary"
            className={`px-3 py-1 font-medium rounded-full text-green-500`}
          >
            <UserRoundCheck className="w-3 h-3" />
            <span>Present</span>
            <span className="font-bold">{data?.present}</span>
          </Badge>
          <Badge
            variant="secondary"
            className={`px-3 py-1 font-medium rounded-full text-rose-500`}
          >
            <UserRoundX className="w-3 h-3 " />
            <span>Absent</span>
            <span className="font-bold">{data?.absent}</span>
          </Badge>
        </div>
      </CardWrapper>

      <EditStudentAttendanceForm attendanceRecords={data?.attendances || []} id={id} />
    </div>
  );
};
