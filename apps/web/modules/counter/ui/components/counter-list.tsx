"use client";

import { Edit, Trash2 } from "lucide-react";

import { Counter } from "@workspace/db";
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

import { useDeleteCounter, useEditCounter } from "@/hooks/use-counter";
import { usePermissions } from "@/hooks/use-user-permission";

interface ConterListProps {
  counters: Counter[];
}

export const CounterList = ({ counters }: ConterListProps) => {
  const { onOpen } = useDeleteCounter();
  const { onOpen: onEdit } = useEditCounter();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {counters.map((counter) => (
          <TableRow key={counter.id} className="even:bg-muted">
            <TableCell>{counter.type}</TableCell>
            <TableCell>{counter.value}</TableCell>
            <TableCell>{counter.session}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(counter.id, counter.session, counter.type, counter.value.toString())
                  }
                  hasPermission={hasPermission("counter", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(counter.id)}
                  hasPermission={hasPermission("counter", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
