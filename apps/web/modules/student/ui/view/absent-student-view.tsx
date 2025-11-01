"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetAbsentStudents } from "../../filters/use-get-absent-students";
import { AbsentFilter } from "../components/absent-filter";
import { AbsentStudentList } from "../components/absent-student-list";

export const AbsentStudentsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetAbsentStudents();

  const { data } = useSuspenseQuery(
    trpc.student.getAbsentMany.queryOptions(filters)
  );

  const { students = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper title="Manage Absent Student" value={totalCount}>
      <AbsentFilter />
      <AbsentStudentList students={students} />
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
