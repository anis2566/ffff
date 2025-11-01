"use client";

import { Edit, Eye, Trash2 } from "lucide-react";

import { Batch } from "@workspace/db";
import { ListActions } from "@workspace/ui/shared/list-actions";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { formatTime } from "@workspace/utils/constant";

import { ListActionButton } from "@/components/list-action-button";
import { ListActionLink } from "@/components/list-action-link";

import { useDeleteBatch } from "@/hooks/use-batch";
import Link from "next/link";
import { usePermissions } from "@/hooks/use-user-permission";

interface BatchWithRelations extends Batch {
  room: {
    name: string;
  };
  _count: {
    students: number;
  };
}

interface BatchListProps {
  batches: BatchWithRelations[];
}

export const BatchList = ({ batches }: BatchListProps) => {
  const { onOpen } = useDeleteBatch();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Capacity</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => (
          <TableRow key={batch.id} className="even:bg-muted">
            <TableCell className="hover:underline">
              <Link href={`/batch/${batch.id}`}>{batch.name}</Link>
            </TableCell>
            <TableCell>{batch.batchClassName}</TableCell>
            <TableCell>{batch.capacity}</TableCell>
            <TableCell>
              {formatTime(batch.time[0] ?? "", "start")} -{" "}
              {formatTime(batch.time[batch.time.length - 1] ?? "", "end")}
            </TableCell>
            <TableCell>{batch.room.name}</TableCell>
            <TableCell>{batch._count.students}</TableCell>
            <TableCell>{batch.session}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/batch/${batch.id}`}
                  icon={Eye}
                  hasPermission={hasPermission("batch", "read")}
                />
                <ListActionLink
                  title="Edit"
                  href={`/batch/edit/${batch.id}`}
                  icon={Edit}
                  hasPermission={hasPermission("batch", "update")}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(batch.id)}
                  hasPermission={hasPermission("batch", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
