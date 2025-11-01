"use client";

import { useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/react";
import { useGetClasses } from "../../filters/use-get-classes";
import { useCreateClass } from "@/hooks/use-class";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper"; 
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
 
import { ClassList } from "../components/class-list";
import { Filter } from "../components/filter";

export const ClassesView = () => { 
  const trpc = useTRPC();
  const [filters, setFilters] = useGetClasses();
  const { onOpen } = useCreateClass();

  const { data } = useSuspenseQuery(trpc.class.getAll.queryOptions(filters));

  const classes = data?.classes ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper
      title="Manage Class"
      value={totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <ClassList classes={classes} />
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
