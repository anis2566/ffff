"use client";

import { Teacher, TeacherStatus } from "@workspace/db";
import { Edit, Eye, Trash2, UserRoundCheck, UserRoundX } from "lucide-react";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";

import { Badge } from "@workspace/ui/components/badge";
import { TEACHER_STATUS } from "@workspace/utils/constant";
import { ListActions } from "@workspace/ui/shared/list-actions";

import { ListActionLink } from "@/components/list-action-link";
import { ListActionButton } from "@/components/list-action-button";
import {
  useActiveTeacher,
  useDeactiveTeacher,
  useDeleteTeacher,
} from "@/hooks/use-teacher";
import Link from "next/link";
import { usePermissions } from "@/hooks/use-user-permission";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";

interface TeacherWithRelation extends Teacher {
  teacherStatus: TeacherStatus | null;
}

interface TeacherListProps {
  teachers: TeacherWithRelation[];
}

export const TeacherList = ({ teachers }: TeacherListProps) => {
  const { onOpen } = useDeleteTeacher();
  const { onOpen: onDeactive } = useDeactiveTeacher();
  const { onOpen: onActive } = useActiveTeacher();
  const { hasPermission } = usePermissions();

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-background/60">
          <TableHead>ID</TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Phone</TableHead>
          <TableHead>A. Days</TableHead>
          <TableHead>A. Times</TableHead>
          <TableHead>B. Times</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Session</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teachers.map((teacher) => (
          <TableRow key={teacher.id} className="even:bg-muted">
            <TableCell>{teacher.teacherId}</TableCell>
            <TableCell>
              <Avatar>
                <AvatarImage src={teacher.imageUrl || ""} alt={teacher.name} />
                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </TableCell>
            <TableCell className="hover:underline">
              <Link href={`/teacher/${teacher.id}`}>{teacher.name}</Link>
            </TableCell>
            <TableCell>{teacher.phone}</TableCell>
            <TableCell>{teacher.availableDays.length / 2} days</TableCell>
            <TableCell>{teacher.availableTimes.length / 2} hours</TableCell>
            <TableCell>{teacher.bookedSlots.length / 2} hours</TableCell>
            <TableCell>
              <Badge
                variant={
                  teacher?.teacherStatus?.status === TEACHER_STATUS.Present
                    ? "default"
                    : "destructive"
                }
                className="rounded-full"
              >
                {teacher?.teacherStatus?.status}
              </Badge>
            </TableCell>
            <TableCell>{teacher.session}</TableCell>
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/teacher/${teacher.id}`}
                  icon={Eye}
                  hasPermission={hasPermission("teacher", "read")}
                />
                <ListActionLink
                  title="Edit"
                  href={`/teacher/edit/${teacher.id}`}
                  icon={Edit}
                  hasPermission={hasPermission("teacher", "update")}
                />
                <ListActionButton
                  isDanger={
                    teacher.teacherStatus?.status === TEACHER_STATUS.Present
                  }
                  title={
                    teacher.teacherStatus?.status === TEACHER_STATUS.Present
                      ? "Deactivate"
                      : "Activate"
                  }
                  icon={
                    teacher.teacherStatus?.status === TEACHER_STATUS.Present
                      ? UserRoundX
                      : UserRoundCheck
                  }
                  onClick={() =>
                    teacher.teacherStatus?.status === TEACHER_STATUS.Present
                      ? onDeactive(teacher.id)
                      : onActive(teacher.id)
                  }
                  hasPermission={hasPermission("teacher", "read")}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(teacher.id)}
                  hasPermission={hasPermission("teacher", "delete")}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
