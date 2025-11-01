"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";
import { useCallback } from "react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetHouses } from "../../filters/use-get-houses";
import { HouseList } from "../components/house-list";
import { Filter } from "../components/filter";
import { useCreateHouse } from "@/hooks/use-house";

export const HousesView = () => {
  const [filters, setFilters] = useGetHouses();
  const trpc = useTRPC();
  const { onOpen } = useCreateHouse();

  const { data } = useSuspenseQuery(
    trpc.house.getMany.queryOptions({
      ...filters,
    })
  );

  const { houses = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper
        title="Manage House"
        value={totalCount}
        actionButtons
        onClickAction={onOpen}
      >
        <Filter />
        <HouseList houses={houses} />
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
