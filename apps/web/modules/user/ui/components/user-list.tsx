"use client";

import { Trash2, UserCog } from "lucide-react";

import { User } from "@workspace/db";
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

import { Badge } from "@workspace/ui/components/badge";
import { ROLE } from "@workspace/utils/constant";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { useChangeRole, useDeleteUser } from "@/hooks/use-user";

interface UserWithRelations extends User {
  roles: {
    name: string;
  }[];
}

interface UserListProps {
  users: UserWithRelations[];
}

export const UserList = ({ users }: UserListProps) => {
  const { onOpen } = useDeleteUser();
  const { onOpen: onChange } = useChangeRole();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <Avatar>
                <AvatarImage src={user.image || ""} />
                <AvatarFallback>
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell className="">
              {user.roles.map((role, index) => (
                <Badge
                  variant={role.name === ROLE.User ? "secondary" : "default"}
                  key={index}
                  className="mr-2 last:mr-0 rounded-full"
                >
                  {role.name}
                </Badge>
              ))}
            </TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Change Role"
                  icon={UserCog}
                  onClick={() =>
                    onChange(
                      user.id,
                      user.roles.map((r) => r.name)
                    )
                  }
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(user.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
