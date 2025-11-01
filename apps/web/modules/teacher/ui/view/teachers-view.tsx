"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetTeachers } from "../../filters/use-get-teachers";
import { TeacherList } from "../components/teacher-list";
import { Filter } from "../components/filter";
import { useCallback } from "react";

export const TeachersView = () => {
  const [filters, setFilters] = useGetTeachers();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.teacher.getMany.queryOptions({
      ...filters,
    })
  );

  const { teachers = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Teacher" value={totalCount}>
        <Filter />
        <TeacherList teachers={teachers} />
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
    </div>
  );
};
