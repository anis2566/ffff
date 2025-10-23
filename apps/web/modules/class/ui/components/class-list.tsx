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
import { usePermissions } from "@/hooks/use-user-permission";

interface ClassNameWithRelation extends ClassName {
  _count: {
    batches: number;
    students: number;
  }
}

interface ClassListProps {
  classes: ClassNameWithRelation[];
}

export const ClassList = ({ classes }: ClassListProps) => {
  const { onOpen } = useDeleteClass();
  const { onOpen: onEdit } = useEditClass();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Level</TableHead>
          <TableHead>Batches</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {classes.map((classItem) => (
          <TableRow key={classItem.id} className="even:bg-muted">
            <TableCell>{classItem.name}</TableCell>
            <TableCell>{classItem.level}</TableCell>
            <TableCell>{classItem._count.batches}</TableCell>
            <TableCell>{classItem._count.students}</TableCell>
            <TableCell>{classItem.session}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      classItem.id,
                      classItem.session,
                      classItem.name,
                      classItem.level,
                      classItem.position.toString()
                    )
                  }
                  hasPermission={hasPermission("class", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(classItem.id)}
                  hasPermission={hasPermission("class", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
