"use client";

import { Edit, Eye, RefreshCcw, Trash2 } from "lucide-react";

import { ExamResultGroup } from "@workspace/db";
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
import { ListActionLink } from "@/components/list-action-link";
import { Badge } from "@workspace/ui/components/badge";
import { EXAM_STATUS } from "@workspace/utils/constant";
import { useDeleteResult, useToggleResultStatus } from "@/hooks/use-result";

interface ExamResultWithRelation extends ExamResultGroup {
  exam: {
    name: string;
  };
  className: {
    name: string;
  };
  batch: {
    name: string;
  };
  subject: {
    name: string;
  };
  examCategory: {
    name: string;
  };
}

interface HomeworkListProps {
  results: ExamResultWithRelation[];
}

export const ResultList = ({ results }: HomeworkListProps) => {
  const { onOpen } = useDeleteResult();
  const { onOpen: onOpenStatus } = useToggleResultStatus();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Exam</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Attended</TableHead>
          <TableHead>Absent</TableHead>
          <TableHead>Highest</TableHead>
          <TableHead>Lowest</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {results.map((result) => (
          <TableRow key={result.id}>
            <TableCell>{result.exam.name}</TableCell>
            <TableCell>{result.examCategory.name}</TableCell>
            <TableCell>{result.subject.name}</TableCell>
            <TableCell>{result.batch.name}</TableCell>
            <TableCell>{result.className.name}</TableCell>
            <TableCell>{result.total}</TableCell>
            <TableCell>{result.attended}</TableCell>
            <TableCell>{result.absent}</TableCell>
            <TableCell>
              {result.highestMarks ? result.highestMarks : "-"}
            </TableCell>
            <TableCell>
              {result.lowestMarks !== null ? result.lowestMarks : "-"}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  result.status === EXAM_STATUS.Published
                    ? "default"
                    : "destructive"
                }
                className="rounded-full"
              >
                {result.status}
              </Badge>
            </TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/exam/result/${result.id}`}
                  icon={Eye}
                />
                <ListActionLink
                  title="Edit"
                  href={`/exam/result/edit/${result.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  title="Toggle Status"
                  icon={RefreshCcw}
                  onClick={() => onOpenStatus(result.id, result.status)}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(result.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
