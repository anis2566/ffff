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
import { ListActionLink } from "@/components/list-action-link";
import { useDeleteHouse } from "@/hooks/use-house";

interface HouseListProps {
  houses: House[];
}

export const HouseList = ({ houses }: HouseListProps) => {
  const { onOpen } = useDeleteHouse();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Rooms</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {houses.map((house) => (
          <TableRow key={house.id}>
            <TableCell>{house.name}</TableCell>
            <TableCell>{house.roomCount}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="Edit"
                  href={`/house/edit/${house.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(house.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
