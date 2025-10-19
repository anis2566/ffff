"use client";

import {
  ArrowUpFromLine,
  Edit,
  FileUser,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { Exam } from "@workspace/db";
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

import { useDeleteExam, usePushToDocument } from "@/hooks/use-exam";

interface ExamWithRelation extends Exam {
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
  exams: ExamWithRelation[];
}

export const ExamList = ({ exams }: HomeworkListProps) => {
  const { onOpen } = useDeleteExam();
  const { onOpen: onPush } = usePushToDocument();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>CQ</TableHead>
          <TableHead>MCQ</TableHead>
          <TableHead>Written</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell className="hover:underline">
              <Link href={`/exam/${exam.id}`}>{exam.name}</Link>
            </TableCell>
            <TableCell>{exam.topic}</TableCell>
            <TableCell>{exam.examCategory.name}</TableCell>
            <TableCell>{format(exam.date, "dd MMM yyyy")}</TableCell>
            <TableCell>{exam.subject.name}</TableCell>
            <TableCell>{exam.batch.name}</TableCell>
            <TableCell>{exam.className.name}</TableCell>
            <TableCell>{exam.cq}</TableCell>
            <TableCell>{exam.mcq}</TableCell>
            <TableCell>{exam.written}</TableCell>
            <TableCell>{exam.total}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="Edit"
                  href={`/exam/edit/${exam.id}`}
                  icon={Edit}
                />
                <ListActionLink
                  title="Result"
                  href={`/exam/${exam.id}/result`}
                  icon={FileUser}
                />
                <ListActionButton
                  title="Push to Document"
                  icon={ArrowUpFromLine}
                  onClick={() =>
                    onPush(exam.name, exam.classNameId, exam.subjectId)
                  }
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(exam.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
