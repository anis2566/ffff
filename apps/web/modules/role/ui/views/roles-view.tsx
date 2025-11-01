"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

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

  const { roles = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper
      title="Manage Role"
      value={totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <RoleList roles={roles} />
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
