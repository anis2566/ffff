"use client";

import { Edit, Eye, Send, Trash2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { HomeworkGroup } from "@workspace/db";
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
import { useDeleteHomework } from "@/hooks/use-homework";
import { usePermissions } from "@/hooks/use-user-permission";

interface HomeworkWithRelation extends HomeworkGroup {
  className: {
    name: string;
  };
  batch: {
    name: string;
  };
  subject: {
    name: string;
  };
}

interface HomeworkListProps {
  homeworks: HomeworkWithRelation[];
}

export const HomeworkList = ({ homeworks }: HomeworkListProps) => {
  const { onOpen } = useDeleteHomework();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Finished</TableHead>
          <TableHead>Unfinished</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {homeworks.map((homework) => (
          <TableRow key={homework.id} className="even:bg-muted">
            <TableCell className="hover:underline">
              <Link href={`/homework/${homework.id}`}>{homework.name}</Link>
            </TableCell>
            <TableCell>{homework.subject.name}</TableCell>
            <TableCell>{homework.batch.name}</TableCell>
            <TableCell>{homework.className.name}</TableCell>
            <TableCell>{format(homework.createdAt, "dd MMM yyyy")}</TableCell>
            <TableCell>{homework.total}</TableCell>
            <TableCell>{homework.finished}</TableCell>
            <TableCell>{homework.unfinished}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/homework/${homework.id}`}
                  icon={Eye}
                  hasPermission={hasPermission("homework", "read")}
                />
                <ListActionLink
                  title="Edit"
                  href={`/homework/edit/${homework.id}`}
                  icon={Edit}
                  hasPermission={hasPermission("homework", "update")}
                />
                <ListActionButton
                  title="Send SMS"
                  icon={Send}
                  onClick={() => {}}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(homework.id)}
                  hasPermission={hasPermission("homework", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
