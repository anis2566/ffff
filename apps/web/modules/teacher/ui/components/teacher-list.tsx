"use client";

import { Teacher, TeacherStatus } from "@workspace/db";
import { Edit, Eye, Trash2 } from "lucide-react";

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
import { useDeleteTeacher } from "@/hooks/use-teacher";
import Link from "next/link";

interface TeacherWithRelation extends Teacher {
  teacherStatus: TeacherStatus | null;
}

interface TeacherListProps {
  teachers: TeacherWithRelation[];
}

export const TeacherList = ({ teachers }: TeacherListProps) => {
  const {onOpen} = useDeleteTeacher();

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
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teachers.map((teacher) => (
          <TableRow key={teacher.id}>
            <TableCell>{teacher.teacherId}</TableCell>
            <TableCell>Image</TableCell>
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
            <TableCell>
              <ListActions>
                <ListActionLink
                  title="View"
                  href={`/teacher/${teacher.id}`}
                  icon={Eye}
                />
                <ListActionLink
                  title="Edit"
                  href={`/teacher/edit/${teacher.id}`}
                  icon={Edit}
                />
                <ListActionButton
                  isDanger
                  title="Delete"
                  icon={Trash2}
                  onClick={() => onOpen(teacher.id)}
                />
              </ListActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
