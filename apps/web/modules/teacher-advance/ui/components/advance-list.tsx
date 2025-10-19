"use client";

import { format } from "date-fns";
import { Edit, RefreshCcw } from "lucide-react";

import { TeacherAdvance } from "@workspace/db";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { ListActions } from "@workspace/ui/shared/list-actions";
import { ListActionLink } from "@/components/list-action-link";
import { Badge } from "@workspace/ui/components/badge";
import { TEACHER_ADVANCE_STATUS } from "@workspace/utils/constant";
import { ListActionButton } from "@/components/list-action-button";
import { useAdvanceStatus } from "@/hooks/use-teacher-advance";

interface TeacherAdvanceWithRealtion extends TeacherAdvance {
  teacher: {
    name: string;
    imageUrl: string | null;
    teacherId: number;
  };
}

interface AdvanceListProps {
  advances: TeacherAdvanceWithRealtion[];
}

export const AdvanceList = ({ advances }: AdvanceListProps) => {
  const { onOpen } = useAdvanceStatus();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>#ID</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Month</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {advances.map((advance) => (
          <TableRow key={advance.id}>
            <TableCell>{advance.teacher.teacherId}</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>{advance.teacher.name}</TableCell>
            <TableCell>
              {format(advance.createdAt, "dd MMM yyyy hh:mm a")}
            </TableCell>
            <TableCell>{advance.month}</TableCell>
            <TableCell>{advance.amount}</TableCell>
            <TableCell>
              <Badge
                variant={
                  advance.status === TEACHER_ADVANCE_STATUS.Pending
                    ? "outline"
                    : advance.status === TEACHER_ADVANCE_STATUS.Approved
                      ? "default"
                      : "destructive"
                }
                className="rounded-full"
              >
                {advance.status}
              </Badge>
            </TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="Edit"
                  href={`/expense/advance/edit/${advance.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  title="Change Status"
                  icon={RefreshCcw}
                  onClick={() => onOpen(advance.id, advance.status)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
