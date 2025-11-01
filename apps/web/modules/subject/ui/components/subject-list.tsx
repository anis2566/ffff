"use client";

import { Edit, Trash2 } from "lucide-react";

import { Subject } from "@workspace/db";
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

import { useDeleteSubject, useEditSubject } from "@/hooks/use-subject";
import { usePermissions } from "@/hooks/use-user-permission";

interface SubjectListProps {
  subjects: Subject[];
}

export const SubjectList = ({ subjects }: SubjectListProps) => {
  const { onOpen } = useDeleteSubject();
  const { onOpen: onEdit } = useEditSubject();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id} className="even:bg-muted">
            <TableCell>{subject.name}</TableCell>
            <TableCell>{subject.level}</TableCell>
            <TableCell>{subject.group ? subject.group : "-"}</TableCell>
            <TableCell>{subject.session}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      subject.id,
                      subject.session,
                      subject.name,
                      subject.level,
                      subject.group || undefined
                    )
                  }
                  hasPermission={hasPermission("subject", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(subject.id)}
                  hasPermission={hasPermission("subject", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
