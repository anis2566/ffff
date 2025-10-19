"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetHomeworks } from "../../filters/use-get-homeworks";
import { HomeworkList } from "../components/homework-list";
import { Filter } from "../components/filter";

export const HomeworksView = () => {
  const [filters, setFilters] = useGetHomeworks();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.homework.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Homework" value={data?.totalCount}>
        <Filter />
        <HomeworkList homeworks={data?.homeworks} />
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
    </div>
  );
};
