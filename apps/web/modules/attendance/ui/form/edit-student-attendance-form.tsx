"use client";

import { Attendance } from "@workspace/db";
import { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { Button } from "@workspace/ui/components/button";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { useGetStudentAttendances } from "../../filters/use-get-student-attendances";

type AttendanceRecord = {
  attendanceId: string;
  studentId: string;
  status: string;
};

interface AttendanceWithRelations extends Attendance {
  student: {
    name: string;
    studentId: number;
    mPhone: string;
    id: string;
  };
}

interface EditStudentAttendanceFormProps {
  attendanceRecords: AttendanceWithRelations[];
  id: string;
}

export default function EditStudentAttendanceForm({
  attendanceRecords,
  id,
}: EditStudentAttendanceFormProps) {
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters] = useGetStudentAttendances();

  useEffect(() => {
    setAttendances(
      attendanceRecords.map((record) => ({
        attendanceId: record.id,
        studentId: record.student.id,
        status: record.status,
      }))
    );
  }, [attendanceRecords]);

  const { mutate: updateAttendance, isPending } = useMutation(
    trpc.studentAttendance.updateMany.mutationOptions({
      onError: (err) => {
        setErrorText(err.message);
        setButtonState("error");
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          setButtonState("error");
          setErrorText(data.message);
          toast.error(data.message);
          return;
        }
        setButtonState("success");
        toast.success(data.message);
        queryClient.invalidateQueries(
          trpc.studentAttendance.getMany.queryOptions({ ...filters })
        );
        router.push(`/attendance/student/${id}`);
      },
    })
  );

  const presentCount = attendances.filter((a) => a.status === "present").length;

  const allPresent =
    attendances &&
    attendances.length > 0 &&
    presentCount === attendances.length;

  const somePresent =
    presentCount > 0 && presentCount < (attendances?.length || 0);

  const isStudentPresent = (attendanceId: string) => {
    const attendance = attendances.find((a) => a.attendanceId === attendanceId);
    return attendance ? attendance.status === "present" : false;
  };

  const toggleStudent = (attendanceId: string) => {
    setAttendances((prev) =>
      prev.map((a) =>
        a.attendanceId === attendanceId
          ? { ...a, status: a.status === "present" ? "absent" : "present" }
          : a
      )
    );
  };

  const toggleAll = () => {
    if (allPresent) {
      setAttendances((prev) =>
        prev.map((a) => ({ ...a, status: "absent" as const }))
      );
    } else {
      setAttendances((prev) =>
        prev.map((a) => ({ ...a, status: "present" as const }))
      );
    }
  };

  const markAllPresent = () => {
    setAttendances((prev) =>
      prev.map((a) => ({ ...a, status: "present" as const }))
    );
  };

  const markAllAbsent = () => {
    setAttendances((prev) =>
      prev.map((a) => ({ ...a, status: "absent" as const }))
    );
  };

  const handleSubmit = () => {
    setButtonState("loading");
    updateAttendance({
      attendanceId: id,
      attendances,
    });
  };

  return (
    <CardWrapper
      title={`${presentCount} of ${attendanceRecords?.length} present`}
      contentClassName="space-y-4"
    >
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant={allPresent ? "secondary" : "ghost"}
          onClick={markAllPresent}
        >
          Mark All Present
        </Button>
        <Button
          size="sm"
          variant={!allPresent && presentCount === 0 ? "secondary" : "ghost"}
          onClick={markAllAbsent}
        >
          Mark All Absent
        </Button>
        {presentCount > 0 && presentCount < attendances.length && (
          <Button
            size="sm"
            className="rounded-full"
            variant="destructive"
            onClick={markAllAbsent}
          >
            Clear
          </Button>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-background/60">
            <TableHead className="w-12">
              <Checkbox
                checked={allPresent}
                onCheckedChange={toggleAll}
                aria-label="Select all students"
                className={somePresent ? "opacity-50" : ""}
                disabled={isPending}
              />
            </TableHead>
            <TableHead>#ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendanceRecords?.map((attendance) => {
            const isPresent = isStudentPresent(attendance.id);
            return (
              <TableRow
                key={attendance.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggleStudent(attendance.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isPresent}
                    onCheckedChange={() => toggleStudent(attendance.id)}
                    aria-label={`Mark ${attendance.student.name} as present`}
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell>{attendance.student.studentId}</TableCell>
                <TableCell>{attendance.student.name}</TableCell>
                <TableCell>{attendance.student.mPhone}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <LoadingButton
        type="button"
        onClick={handleSubmit}
        loadingText="Updating..."
        successText="Updated!"
        errorText={errorText || "Failed"}
        state={buttonState}
        onStateChange={setButtonState}
        className="w-full rounded-full"
        icon={Send}
        disabled={attendances.length === 0}
      >
        Update
      </LoadingButton>
    </CardWrapper>
  );
}
