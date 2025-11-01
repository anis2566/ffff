"use client";

import { Edit, Trash2 } from "lucide-react";

import { AdmissionFee } from "@workspace/db";
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
import { usePermissions } from "@/hooks/use-user-permission";

interface FeeWithRelation extends AdmissionFee {
  className: {
    name: string;
  };
}

interface AdmissionFeeListProps {
  fees: FeeWithRelation[];
}

export const FeeList = ({ fees }: AdmissionFeeListProps) => {
  const { onOpen } = useDeleteAdmissionFee();
  const { onOpen: onEdit } = useEditAdmissionFee();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Class</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {fees.map((fee) => (
          <TableRow key={fee.id} className="even:bg-muted">
            <TableCell>{fee.className.name}</TableCell>
            <TableCell>{fee.amount}</TableCell>
            <TableCell>{fee.session}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionButton
                  title="Edit"
                  icon={Edit}
                  onClick={() =>
                    onEdit(fee.id, fee.session, fee.classNameId, fee.amount.toString())
                  }
                  hasPermission={hasPermission("admission_fee", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(fee.id)}
                  hasPermission={hasPermission("admission_fee", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
