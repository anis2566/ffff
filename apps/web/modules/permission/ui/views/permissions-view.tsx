"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";

import { useGetPermissions } from "../../filters/use-get-permissions";
import { useCreatePermission } from "@/hooks/use-permission";
import { PermissionList } from "../components/permission-list";
import { Filter } from "../components/filter";

export const PermissionsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetPermissions();
  const { onOpen } = useCreatePermission();

  const { data } = useSuspenseQuery(
    trpc.permission.getMany.queryOptions(filters)
  );

  const { permissions = [] } = data;

  return (
    <ListCardWrapper
      title="Manage Permissions"
      value={data?.totalCount || 0}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <PermissionList permissions={permissions} />
    </ListCardWrapper>
  );
};
