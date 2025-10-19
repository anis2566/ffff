"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetUsers } from "../../filters/use-get-users";
import { UserList } from "../components/user-list";
import { Filter } from "../components/filter";

export const UsersView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetUsers();

  const { data } = useSuspenseQuery(trpc.user.getMany.queryOptions(filters));

  return (
    <ListCardWrapper title="Manage User" value={data?.totalCount}>
      <Filter />
      <UserList users={data?.users} />
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
