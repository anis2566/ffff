"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";

interface TeachersProps {
  batchId: string;
}

export const Teachers = ({ batchId }: TeachersProps) => {
  const trpc = useTRPC();

  const { data: teachers, isLoading } = useQuery(
    trpc.teacher.getByBatch.queryOptions(batchId)
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
      title="Teachers"
      value={teachers?.length}
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers?.map((teacher) => (
            <TableRow key={teacher.id}>
              <TableCell>{teacher.teacherId}</TableCell>
              <TableCell>
                <Avatar>
                  <AvatarImage src={teacher.imageUrl || ""} />
                  <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{teacher.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ListCardWrapper>
  );
};
