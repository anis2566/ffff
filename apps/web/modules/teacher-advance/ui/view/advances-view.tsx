"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetAdvances } from "../../filters/use-get-advances";
import { AdvanceList } from "../components/advance-list";
import { Filter } from "../components/filter";

export const TeacherAdvancesView = () => {
  const [filters, setFilters] = useGetAdvances();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.teacherAdvance.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Advances" value={data?.totalCount}>
        <Filter />
        <AdvanceList advances={data?.advances} />
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
