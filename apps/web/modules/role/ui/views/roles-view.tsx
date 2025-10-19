"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetRoles } from "../../filters/use-get-roles";
import { RoleList } from "../components/role-list";
import { useCreateRole } from "@/hooks/use-role";
import { Filter } from "../components/filter";

export const RolesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetRoles();
  const { onOpen } = useCreateRole();

  const { data } = useSuspenseQuery(trpc.role.getMany.queryOptions(filters));

  return (
    <ListCardWrapper
      title="Manage Role"
      value={data?.totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <RoleList roles={data?.roles ?? []} />
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
