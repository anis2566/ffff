"use client";

import { Edit, Trash2 } from "lucide-react";

import { House } from "@workspace/db";
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

import { useDeleteHouse, useEditHouse } from "@/hooks/use-house";
import { usePermissions } from "@/hooks/use-user-permission";

interface HouseWithRelation extends House {
  _count: {
    rooms: number;
  };
}

interface HouseListProps {
  houses: HouseWithRelation[];
}

export const HouseList = ({ houses }: HouseListProps) => {
  const { onOpen } = useDeleteHouse();
  const { onOpen: onEdit } = useEditHouse();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>No of Rooms</TableHead>
          <TableHead>Book Rooms</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {houses.map((house) => (
          <TableRow key={house.id} className="even:bg-muted">
            <TableCell>{house.name}</TableCell>
            <TableCell>{house.roomCount}</TableCell>
            <TableCell>{house._count.rooms}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() => onEdit(house.id, house.name, house.roomCount)}
                  hasPermission={hasPermission("class", "update")}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(house.id)}
                  hasPermission={hasPermission("house", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
