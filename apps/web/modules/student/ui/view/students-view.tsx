"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetStudents } from "../../filters/use-get-students";
import { StudentList } from "../components/student-list";
import { Filter } from "../components/filter";

export const StudentsView = () => { 
  const trpc = useTRPC();
  const [filters, setFilters] = useGetStudents();

  const { data } = useSuspenseQuery(trpc.student.getMany.queryOptions(filters));

  const { students = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper title="Manage Student" value={totalCount}>
      <Filter />
      <StudentList students={students} />
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
