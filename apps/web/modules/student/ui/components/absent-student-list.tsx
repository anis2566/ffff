"use client";

import { Edit, Eye, Trash2, UserRoundCheck } from "lucide-react";
import Link from "next/link";

import { ClassName, Student, StudentStatus } from "@workspace/db";
import { ListActions } from "@workspace/ui/shared/list-actions";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { STUDENT_STATUS } from "@workspace/utils/constant";

import { ListActionButton } from "@/components/list-action-button";
import { ListActionLink } from "@/components/list-action-link";
import { useDeleteStudent, useMarkPesentStudent } from "@/hooks/use-student";

interface StudentWithRelation extends Student {
  className: ClassName;
  studentStatus: StudentStatus | null;
  salaryPayments: {
    id: string;
  }[];
}

interface StudentListProps {
  students: StudentWithRelation[];
}

export const AbsentStudentList = ({ students }: StudentListProps) => {
  const { onOpen } = useDeleteStudent();
  const { onOpen: onOpenMarkPresent } = useMarkPesentStudent();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>#ID</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Institute</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Group</TableHead>
          <TableHead>F. Phone</TableHead>
          <TableHead>M. Phone</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Due Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell>{student.studentId}</TableCell>
            <TableCell>Image</TableCell>
            <TableCell className="hover:underline">
              <Link href={`/student/${student.id}`} prefetch>
                {student.name}
              </Link>
            </TableCell>
            <TableCell>{student.school}</TableCell>
            <TableCell>{student.className.name}</TableCell>
            <TableCell>{student.group ? student.group : "-"}</TableCell>
            <TableCell>{student.fPhone}</TableCell>
            <TableCell>{student.mPhone}</TableCell>
            <TableCell>{student.session}</TableCell>
            <TableCell>
              <Badge
                variant={
                  student.salaryPayments.length <= 0 ? "default" : "destructive"
                }
              >
                {student.salaryPayments.length} month
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  student.studentStatus?.status === STUDENT_STATUS.Present
                    ? "default"
                    : "destructive"
                }
                className="rounded-full"
              >
                {student.studentStatus?.status}
              </Badge>
            </TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/student/${student.id}`}
                  icon={Eye}
                />
                <ListActionLink
                  title="Edit"
                  href={`/student/edit/${student.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  title="Mark as Present"
                  icon={UserRoundCheck}
                  onClick={() => onOpenMarkPresent(student.id)}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(student.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
