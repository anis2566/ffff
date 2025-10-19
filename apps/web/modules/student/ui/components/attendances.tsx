"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useGetAttendances } from "../../filters/use-get-attendances";
import { Download, Loader2 } from "lucide-react";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { format } from "date-fns";
import { ATTENDANCE_STATUS } from "@workspace/utils/constant";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

interface AttendancesProps {
  studentId: string;
}

export const Attendances = ({ studentId }: AttendancesProps) => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetAttendances();

  const { data, isLoading } = useQuery(
    trpc.studentAttendance.getByStudent.queryOptions({ studentId, ...filters })
  );

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ListCardWrapper
      title="Attendances"
      value={data?.totalCount}
      actionButtons
      actionButtonText="Export to CSV"
      actionButtonVariant="secondary"
      actionButtonIcon={Download}
      onClickAction={() => {}}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>Date</TableHead>
            <TableHead>Day</TableHead>
            <TableHead>Month</TableHead>
            <TableHead>Session</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>A. Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.attendances?.map((attendance) => (
            <TableRow key={attendance.id}>
              <TableCell>{format(attendance.date, "dd MMM yyyy")}</TableCell>
              <TableCell>{attendance.day}</TableCell>
              <TableCell>{attendance.month}</TableCell>
              <TableCell>{attendance.session}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    attendance.status ===
                    ATTENDANCE_STATUS.Present.toLocaleLowerCase()
                      ? "default"
                      : "destructive"
                  }
                  className="capitalize rounded-full"
                >
                  {attendance.status}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[150px] truncate">
                {attendance.absentReason ? attendance.absentReason : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DesktopPagination
        totalCount={data?.totalCount || 0}
        currentPage={filters.page}
        pageSize={5}
        onPageChange={(page) => setFilters({ page })}
      />
      <MobilePagination
        totalCount={data?.totalCount || 0}
        currentPage={filters.page}
        pageSize={5}
        onPageChange={(page) => setFilters({ page })}
      />
    </ListCardWrapper>
  );
};
