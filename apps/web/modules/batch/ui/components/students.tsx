"use client";

import { useTRPC } from "@/trpc/react";
import { ArrowRightLeft, Download, Eye, Loader2, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { ListActions } from "@workspace/ui/shared/list-actions";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";

import { ListActionLink } from "@/components/list-action-link";
import { ListActionButton } from "@/components/list-action-button";
import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { useRemoveFromBatch } from "@/hooks/use-batch";
import { useBatchTransfer } from "@/hooks/use-student";

interface StudentsProps {
  batchId: string;
  className: string;
}

export const Students = ({ batchId, className }: StudentsProps) => {
  const trpc = useTRPC();
  const { onOpen } = useRemoveFromBatch();
  const { onOpen: onOpenBatchTransfer } = useBatchTransfer();

  const { data: students, isLoading } = useQuery(
    trpc.student.getByBatch.queryOptions(batchId)
  );

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ListCardWrapper
      title="Students"
      value={students?.length}
      actionButtons
      actionButtonText="Export to CSV"
      actionButtonVariant="secondary"
      actionButtonIcon={Download}
      onClickAction={() => {}}
    >
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead>#ID</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students?.map((student) => (
            <TableRow key={student.id}>
              <TableCell>{student.studentId}</TableCell>
              <TableCell>
                <Avatar>
                  <AvatarImage src={student.imageUrl || ""} />
                  <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{student.name}</TableCell>
              <TableCell>{student?.mPhone}</TableCell>
              <TableCell>{5}</TableCell>
              <TableCell>
                <ListActions>
                  <ListActionLink
                    title="View"
                    href={`/student/${student.id}`}
                    icon={Eye}
                  />
                  <ListActionButton
                    title="Batch Transfer"
                    icon={ArrowRightLeft}
                    onClick={() =>
                      onOpenBatchTransfer(
                        student.id,
                        student?.batch?.name || "",
                        student?.classNameId || "",
                        student.batchId || ""
                      )
                    }
                  />
                  <ListActionButton
                    isDanger
                    title="Remove"
                    icon={Trash2}
                    onClick={() => onOpen(student.id, batchId)}
                  />
                </ListActions>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ListCardWrapper>
  );
};
