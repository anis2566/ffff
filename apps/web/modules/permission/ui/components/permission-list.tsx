"use client";

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
import { useEditPermission } from "@/hooks/use-permission";

interface PermissionListProps {
  permissions: {
    module: string;
    name: string;
    permissions: Omit<
      {
        roles: {
          description: string | null;
          id: string;
          createdAt: Date;
          updatedAt: Date;
          name: string;
          userIds: string[];
          permissionIds: string[];
        }[];
      } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        roleIds: string[];
        module: string;
        action: string;
      },
      "name" | "module"
    >[];
  }[];
}

export const PermissionList = ({ permissions }: PermissionListProps) => {
  const { onOpen } = useEditPermission();
  return (
    <div className="space-y-6">
      {permissions?.map((permission, index) => (
        <CardWrapper key={index} title={permission.module}>
          <Table>
            <TableHeader>
              <TableRow className="bg-background/60">
                <TableHead>Name</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permission?.permissions?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.action}</TableCell>
                  <TableCell className="flex items-center gap-x-2">
                    {item.roles.map((role, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="rounded-full"
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        onOpen(
                          item.id,
                          permission.module,
                          item.action,
                          item.roles.map((i) => i.name)
                        )
                      }
                    >
                      <Edit />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardWrapper>
      ))}
    </div>
  );
};
