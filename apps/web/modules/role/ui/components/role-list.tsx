"use client";

import { Edit, Trash2 } from "lucide-react";

import { Role } from "@workspace/db";
import { ListActions } from "@workspace/ui/shared/list-actions";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";

import { ListActionButton } from "@/components/list-action-button";

import { useDeleteRole, useEditRole } from "@/hooks/use-role";
import { usePermissions } from "@/hooks/use-user-permission";

interface RoleWithRelations extends Role {
  _count: {
    permissions: number;
  };
}

interface RoleListProps {
  roles: RoleWithRelations[];
}

export const RoleList = ({ roles }: RoleListProps) => {
  const { onOpen } = useDeleteRole();
  const { onOpen: onEdit } = useEditRole();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>No of Permission</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {roles.map((role) => (
          <TableRow key={role.id} className="even:bg-muted">
            <TableCell>{role.name}</TableCell>
            <TableCell>{role._count.permissions}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(role.id, role.name, role.description ?? undefined)
                  }
                  hasPermission={hasPermission("role", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(role.id)}
                  hasPermission={hasPermission("role", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
