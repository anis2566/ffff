"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetStudentAttendances } from "../../filters/use-get-student-attendances";
import { AttendanceList } from "../components/attendance-list";
import { Filter } from "../components/filter";
import { useCallback } from "react";

export const StudentAttendancesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetStudentAttendances();

  const { data } = useSuspenseQuery(
    trpc.studentAttendance.getMany.queryOptions(filters)
  );

  const { attendances = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper title="Manage Attendance" value={totalCount}>
      <Filter />
      <AttendanceList attendances={attendances} />
      <DesktopPagination
        totalCount={totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={handlePageChange}
      />
      <MobilePagination
        totalCount={totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={handlePageChange}
      />
    </ListCardWrapper>
  );
};
