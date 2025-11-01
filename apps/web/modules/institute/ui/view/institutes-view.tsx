"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetInstitutes } from "../../filters/use-get-institutes";
import { useCreateInstitute } from "@/hooks/use-institute";
import { InstituteList } from "../components/institute-list";
import { Filter } from "../components/filter";

export const InstitutesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetInstitutes();
  const { onOpen } = useCreateInstitute();

  const { data } = useSuspenseQuery(
    trpc.institute.getMany.queryOptions(filters) 
  );

  const { institutes = [], totalCount = 0 } = data;

  const handlePageChange = (page: number) => {
    setFilters({ page });
  };

  return (
    <ListCardWrapper
      title="Manage Institutes"
      value={totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <InstituteList institutes={institutes} />
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
