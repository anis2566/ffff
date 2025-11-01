"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetBatches } from "../../filters/use-get-batches";
import { BatchList } from "../components/batch-list";
import { useCallback } from "react";
import { Filter } from "../components/filter";

export const BatchesBiew = () => {
  const [filters, setFilters] = useGetBatches();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.batch.getMany.queryOptions({
      ...filters,
    })
  );

  const { batches = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Batch" value={totalCount}>
        <Filter />
        <BatchList batches={batches} />
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
