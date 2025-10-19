"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";

import { useGetPermissions } from "../../filters/use-get-permissions";
import { useCreatePermission } from "@/hooks/use-permission";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Edit } from "lucide-react";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { PermissionList } from "../components/permission-list";

export const PermissionsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetPermissions();
  const { onOpen } = useCreatePermission();

  const { data } = useSuspenseQuery(
    trpc.permission.getMany.queryOptions(filters)
  );

  return (
    <ListCardWrapper
      title="Manage Permissions"
      value={data?.totalCount || 0}
      actionButtons
      onClickAction={onOpen}
    >
      <PermissionList permissions={data?.permissions || []} />
    </ListCardWrapper>
  );
};
