"use client";

import { Edit, Trash2 } from "lucide-react";

import { ClassName } from "@workspace/db";
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

import { useDeleteClass, useEditClass } from "@/hooks/use-class";

interface ClassListProps {
  classes: ClassName[];
}

export const ClassList = ({ classes }: ClassListProps) => {
  const { onOpen } = useDeleteClass();
  const { onOpen: onEdit } = useEditClass();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((classItem) => (
          <TableRow key={classItem.id}>
            <TableCell>{classItem.name}</TableCell>
            <TableCell>{classItem.level}</TableCell>
            <TableCell>{classItem.position}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      classItem.id,
                      classItem.name,
                      classItem.level,
                      classItem.position.toString()
                    )
                  }
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(classItem.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
