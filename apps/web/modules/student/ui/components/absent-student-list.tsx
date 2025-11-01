"use client";

import { Edit, Eye, Trash2, UserRoundCheck } from "lucide-react";
import Link from "next/link";

import { Student, StudentStatus } from "@workspace/db";
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
import { usePermissions } from "@/hooks/use-user-permission";

interface StudentWithRelation extends Student {
  className: {
    name: string;
  };
  institute: {
    name: string;
  };
  studentStatus: StudentStatus | null;
  _count: {
    salaryPayments: number;
  };
}

interface StudentListProps {
  students: StudentWithRelation[];
}

export const AbsentStudentList = ({ students }: StudentListProps) => {
  const { onOpen } = useDeleteStudent();
  const { onOpen: onOpenMarkPresent } = useMarkPesentStudent();
  const { hasPermission } = usePermissions();

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
          <TableRow key={student.id} className="bg-background/60">
            <TableCell>{student.studentId}</TableCell>
            <TableCell>Image</TableCell>
            <TableCell className="hover:underline">
              <Link href={`/student/${student.id}`} prefetch>
                {student.name}
              </Link>
            </TableCell>
            <TableCell>{student.institute.name}</TableCell>
            <TableCell>{student.className.name}</TableCell>
            <TableCell>{student.group ? student.group : "-"}</TableCell>
            <TableCell>{student.fPhone}</TableCell>
            <TableCell>{student.mPhone}</TableCell>
            <TableCell>{student.session}</TableCell>
            <TableCell>
              <Badge
                variant={
                  student._count.salaryPayments <= 0 ? "default" : "destructive"
                }
              >
                {student._count.salaryPayments} month
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
                  hasPermission={hasPermission("student", "read")}
                />
                <ListActionLink
                  title="Edit"
                  href={`/student/edit/${student.id}`}
                  icon={Edit}
                  hasPermission={hasPermission("student", "update")}
                />
                <ListActionButton
                  title="Mark as Present"
                  icon={UserRoundCheck}
                  onClick={() =>
                    onOpenMarkPresent(student.id, student.classNameId)
                  }
                  hasPermission={hasPermission("student", "toggle_present")}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(student.id)}
                  hasPermission={hasPermission("student", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
