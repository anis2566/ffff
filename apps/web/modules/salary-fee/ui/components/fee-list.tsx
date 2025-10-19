"use client";

import { Edit, Trash2 } from "lucide-react";

import { ClassName, SalaryFee } from "@workspace/db";
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

import { useDeleteSalaryFee, useEditSalaryFee } from "@/hooks/use-salary-fee";

interface FeeWithRelation extends SalaryFee {
  className: ClassName;
}

interface SalaryFeeListProps {
  fees: FeeWithRelation[];
}

export const FeeList = ({ fees }: SalaryFeeListProps) => {
  const { onOpen } = useDeleteSalaryFee();
  const { onOpen: onEdit } = useEditSalaryFee();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Type</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => (
          <TableRow key={fee.id}>
            <TableCell>{fee.type}</TableCell>
            <TableCell>{fee.className.name}</TableCell>
            <TableCell>{fee.group ? fee.group : "-"}</TableCell>
            <TableCell>{fee.amount}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(
                      fee.type,
                      fee.id,
                      fee.classNameId,
                      fee.amount.toString(),
                      fee.group || undefined
                    )
                  }
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(fee.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
