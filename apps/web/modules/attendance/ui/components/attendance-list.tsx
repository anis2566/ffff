"use client";

import { Edit, Eye, Send, Trash2 } from "lucide-react";

import { AttendanceGroup } from "@workspace/db";
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
import Link from "next/link";
import { useDeleteStudentAttendance } from "@/hooks/use-student-attendance";
import { usePermissions } from "@/hooks/use-user-permission";

interface AttendanceWithRelations extends AttendanceGroup {
  className: {
    name: string;
  };
  batch: {
    name: string;
  };
}

interface AttendanceListProps {
  attendances: AttendanceWithRelations[];
}

export const AttendanceList = ({ attendances }: AttendanceListProps) => {
  const { onOpen } = useDeleteStudentAttendance();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>Name</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Batch</TableHead>
          <TableHead>Total</TableHead>
          <TableHead>Present</TableHead>
          <TableHead>Absent</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {attendances.map((attendance) => (
          <TableRow key={attendance.id} className="even:bg-muted">
            <TableCell className="hover:underline">
              <Link href={`/attendance/student/${attendance.id}`}>
                {attendance.name}
              </Link>
            </TableCell>
            <TableCell>{attendance.className.name}</TableCell>
            <TableCell>{attendance.batch.name}</TableCell>
            <TableCell>{attendance.total}</TableCell>
            <TableCell>{attendance.present}</TableCell>
            <TableCell>{attendance.absent}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/attendance/student/${attendance.id}`}
                  icon={Eye}
                  hasPermission={hasPermission("student_attendance", "read")}
                />
                <ListActionLink
                  title="Edit"
                  href={`/attendance/student/edit/${attendance.id}`}
                  icon={Edit}
                  hasPermission={hasPermission("student_attendance", "update")}
                />
                <ListActionButton
                  title="Send SMS"
                  icon={Send}
                  onClick={() => {}}
                  hasPermission={hasPermission("student_attendance", "update")}
                />
                <ListActionButton
                  title="Delete"
                  icon={Trash2}
                  isDanger
                  onClick={() => onOpen(attendance.id)}
                  hasPermission={hasPermission("student_attendance", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
