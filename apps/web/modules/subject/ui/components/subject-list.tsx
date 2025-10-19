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

interface SubjectListProps {
  subjects: Subject[];
}

export const SubjectList = ({ subjects }: SubjectListProps) => {
  const { onOpen } = useDeleteSubject();
  const { onOpen: onEdit } = useEditSubject();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {subjects.map((subject) => (
          <TableRow key={subject.id}>
            <TableCell>{subject.name}</TableCell>
            <TableCell>{subject.level}</TableCell>
            <TableCell>{subject.group ? subject.group : "-"}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      subject.id,
                      subject.name,
                      subject.level,
                      subject.group || undefined
                    )
                  }
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(subject.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
