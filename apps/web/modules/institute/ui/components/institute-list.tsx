"use client";

import { Edit, Trash2 } from "lucide-react";

import { Institute } from "@workspace/db";
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

import { useDeleteInstitute, useEditInstitute } from "@/hooks/use-institute";
import { usePermissions } from "@/hooks/use-user-permission";

interface InstituteWithRelations extends Institute {
  _count: {
    students: number;
  };
}
 
interface InstituteListProps {
  institutes: InstituteWithRelations[];
}

export const InstituteList = ({ institutes }: InstituteListProps) => {
  const { onOpen } = useDeleteInstitute();
  const { onOpen: onEdit } = useEditInstitute();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Students</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {institutes.map((institute) => (
          <TableRow key={institute.id} className="even:bg-muted">
            <TableCell>{institute.name}</TableCell>
            <TableCell>{institute.type}</TableCell>
            <TableCell>{institute._count.students}</TableCell>
            <TableCell>{institute.session}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      institute.id,
                      institute.session,
                      institute.type,
                      institute.name
                    )
                  }
                  hasPermission={hasPermission("institute", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(institute.id)}
                  hasPermission={hasPermission("institute", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
