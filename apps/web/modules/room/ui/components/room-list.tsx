"use client";

import { Edit, Trash2 } from "lucide-react";

import { Room } from "@workspace/db";
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

import { useDeleteRoom, useEditRoom } from "@/hooks/use-room";
import { usePermissions } from "@/hooks/use-user-permission";

interface RoomWithRelation extends Room {
  house: {
    name: string;
  };
  _count: {
    batches: number;
  };
}

interface HouseListProps {
  rooms: RoomWithRelation[];
}

export const RoomList = ({ rooms }: HouseListProps) => {
  const { onOpen } = useDeleteRoom();
  const { onOpen: onEdit } = useEditRoom();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>House</TableHead>
          <TableHead>Available Times</TableHead>
          <TableHead>Book Times</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rooms.map((room) => (
          <TableRow key={room.id}>
            <TableCell>{room.name}</TableCell>
            <TableCell>{room.capacity}</TableCell>
            <TableCell>{room.house.name}</TableCell>
            <TableCell>{room.availableTimes.length / 2} hours</TableCell>
            <TableCell>
              {(room.availableTimes.length - room.bookTimes.length) / 2} hours
            </TableCell>
            <TableCell>{room._count.batches}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      room.id,
                      room.houseId,
                      room.name,
                      room.capacity,
                      room.availableTimes
                    )
                  }
                  hasPermission={hasPermission("room", "update")}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(room.id)}
                  hasPermission={hasPermission("room", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
