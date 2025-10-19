"use client";

import { Edit, Trash2 } from "lucide-react";

import { AdmissionFee, ClassName } from "@workspace/db";
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

import {
  useDeleteAdmissionFee,
  useEditAdmissionFee,
} from "@/hooks/use-admission-fee";

interface FeeWithRelation extends AdmissionFee {
  className: ClassName;
}

interface AdmissionFeeListProps {
  fees: FeeWithRelation[];
}

export const FeeList = ({ fees }: AdmissionFeeListProps) => {
  const { onOpen } = useDeleteAdmissionFee();
  const { onOpen: onEdit } = useEditAdmissionFee();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Class</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => (
          <TableRow key={fee.id}>
            <TableCell>{fee.className.name}</TableCell>
            <TableCell>{fee.amount}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(fee.id, fee.classNameId, fee.amount.toString())
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
