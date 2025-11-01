"use client";

import { Edit, Trash2 } from "lucide-react";

import { ExamCategory } from "@workspace/db";
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

import { useDeleteCategory, useEditCategory } from "@/hooks/use-category";
import { usePermissions } from "@/hooks/use-user-permission";

interface CategoryListProps {
  categories: ExamCategory[];
}

export const CategoryList = ({ categories }: CategoryListProps) => {
  const { onOpen } = useDeleteCategory();
  const { onOpen: onEdit } = useEditCategory();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Total Exam</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {categories.map((category) => (
          <TableRow key={category.id}>
            <TableCell>{category.name}</TableCell>
            <TableCell>{5}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() => onEdit(category.id, category.name)}
                  hasPermission={hasPermission("exam_category", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(category.id)}
                  hasPermission={hasPermission("exam_category", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
