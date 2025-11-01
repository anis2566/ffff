"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetUsers } from "../../filters/use-get-users";
import { UserList } from "../components/user-list";
import { Filter } from "../components/filter";
import { useCallback } from "react";

export const UsersView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetUsers();

  const { data } = useSuspenseQuery(trpc.user.getMany.queryOptions(filters));

  const { users = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper title="Manage User" value={totalCount}>
      <Filter />
      <UserList users={users} />
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
