"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

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

  return (
    <ListCardWrapper
      title="Manage Counter"
      value={data?.totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <CounterList counters={data?.counters || []} />
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
