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
import { ListActionLink } from "@/components/list-action-link";

import { useDeleteRoom } from "@/hooks/use-room";

interface RoomWithRelation extends Room {
  house: {
    name: string;
  };
}

interface HouseListProps {
  rooms: RoomWithRelation[];
}

export const RoomList = ({ rooms }: HouseListProps) => {
  const { onOpen } = useDeleteRoom();

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
            <TableCell>5</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="Edit"
                  href={`/room/edit/${room.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(room.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
