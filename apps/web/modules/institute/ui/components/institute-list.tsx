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

interface InstituteListProps {
  institutes: Institute[];
}

export const InstituteList = ({ institutes }: InstituteListProps) => {
  const { onOpen } = useDeleteInstitute();
  const { onOpen: onEdit } = useEditInstitute();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Type</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {institutes.map((institute) => (
          <TableRow key={institute.id}>
            <TableCell>{institute.type}</TableCell>
            <TableCell>{institute.name}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(institute.id, institute.type, institute.name)
                  }
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(institute.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
