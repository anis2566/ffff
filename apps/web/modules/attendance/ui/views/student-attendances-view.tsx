"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetStudentAttendances } from "../../filters/use-get-student-attendances";
import { AttendanceList } from "../components/attendance-list";
import { Filter } from "../components/filter";

export const StudentAttendancesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetStudentAttendances();

  const { data } = useSuspenseQuery(
    trpc.studentAttendance.getMany.queryOptions(filters)
  );

  return (
    <ListCardWrapper title="Manage Attendance" value={data?.totalCount}>
      <Filter />
      <AttendanceList attendances={data?.attendances || []} />
      <DesktopPagination
        totalCount={data?.totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={(page) => setFilters({ page })}
      />
      <MobilePagination
        totalCount={data?.totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={(page) => setFilters({ page })}
      />
    </ListCardWrapper>
  );
};
