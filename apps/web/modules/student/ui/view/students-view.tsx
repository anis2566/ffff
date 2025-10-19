"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

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

  return (
    <ListCardWrapper title="Manage Student" value={data?.totalCount}>
      <Filter />
      <StudentList students={data?.students} />
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
