"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetHomeworks } from "../../filters/use-get-homeworks";
import { HomeworkList } from "../components/homework-list";
import { Filter } from "../components/filter";
import { useCallback } from "react";

export const HomeworksView = () => {
  const [filters, setFilters] = useGetHomeworks();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.homework.getMany.queryOptions({
      ...filters,
    })
  );

  const { homeworks = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Homework" value={totalCount}>
        <Filter />
        <HomeworkList homeworks={homeworks} />
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
