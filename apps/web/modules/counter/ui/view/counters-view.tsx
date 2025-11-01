"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetCounters } from "../../filters/use-get-counters";

import { useCreateCounter } from "@/hooks/use-counter";
import { CounterList } from "../components/counter-list";
import { Filter } from "../components/filter";

export const CountersView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetCounters();
  const { onOpen } = useCreateCounter();

  const { data } = useSuspenseQuery(trpc.counter.getMany.queryOptions(filters));

  const { counters = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper
      title="Manage Counter"
      value={totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <CounterList counters={counters} />
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
