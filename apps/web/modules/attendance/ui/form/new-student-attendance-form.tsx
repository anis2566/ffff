"use client";

import { useTRPC } from "@/trpc/react";
import { useMutation, useQueries } from "@tanstack/react-query";
import { useState } from "react";
import { ChevronDownIcon, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

type AttendanceRecord = {
  studentId: string;
  status: "present" | "absent";
};

export const NewStudentAttendanceForm = () => {
  const [classNameId, setClassNameId] = useState<string>("");
  const [batchId, setBatchId] = useState<string>("");
  const [attendances, setAttendances] = useState<AttendanceRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();

  const [classesQuery, batchesQuery, studentsQuery] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.batch.getByClass.queryOptions(classNameId),
      trpc.student.getByBatch.queryOptions(batchId),
    ],
  });

  const classes = classesQuery.data;
  const batches = batchesQuery.data;
  const students = studentsQuery.data;
  const isLoadingStudents = studentsQuery.isLoading;

  const { mutate: createAttendance, isPending } = useMutation(
    trpc.studentAttendance.createMany.mutationOptions({
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
        // queryClient.invalidateQueries(
        //   trpc.class.getAll.queryOptions({ ...filters })
        // );
        router.push("/attendance/student");
      },
    })
  );

  const presentCount = attendances.filter((a) => a.status === "present").length;

  const allPresent =
    students && students.length > 0 && presentCount === students.length;

  const somePresent =
    presentCount > 0 && presentCount < (students?.length || 0);

  const isStudentPresent = (studentId: string) => {
    return attendances.some(
      (a) => a.studentId === studentId && a.status === "present"
    );
  };

  const toggleStudent = (studentId: string) => {
    setAttendances((prev) => {
      const existing = prev.find((a) => a.studentId === studentId);

      if (existing) {
        if (existing.status === "present") {
          return prev.filter((a) => a.studentId !== studentId);
        }
        return prev.map((a) =>
          a.studentId === studentId ? { ...a, status: "present" } : a
        );
      } else {
        return [...prev, { studentId, status: "present" }];
      }
    });
  };

  const toggleAll = () => {
    if (allPresent) {
      setAttendances([]);
    } else {
      const allPresent: AttendanceRecord[] =
        students?.map((s) => ({
          studentId: s.id,
          status: "present" as const,
        })) || [];
      setAttendances(allPresent);
    }
  };

  const markAllPresent = () => {
    const allPresent: AttendanceRecord[] =
      students?.map((s) => ({
        studentId: s.id,
        status: "present" as const,
      })) || [];
    setAttendances(allPresent);
  };

  const markAllAbsent = () => {
    setAttendances([]);
  };

  const handleClassChange = (value: string) => {
    setClassNameId(value);
    setBatchId("");
    setAttendances([]);
  };

  const handleBatchChange = (value: string) => {
    setBatchId(value);
    setAttendances([]);
  };

  const handleSubmit = () => {
    if (!batchId || !date) return;

    setButtonState("loading");

    const fullAttendances: AttendanceRecord[] =
      students?.map((student) => ({
        studentId: student.id,
        status: isStudentPresent(student.id) ? "present" : "absent",
      })) || [];

    createAttendance({
      date: date.toDateString(),
      batchId,
      attendances: fullAttendances,
    });
  };

  return (
    <div className="space-y-6">
      <FormCardWrapper
        title="New Attendance"
        description="Find batch to create attendance"
      >
        <Select
          onValueChange={handleClassChange}
          value={classNameId}
          disabled={isPending}
        >
          <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background mb-4">
            <SelectValue placeholder="Select class" />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          onValueChange={handleBatchChange}
          value={batchId}
          disabled={isPending}
        >
          <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background mb-4">
            <SelectValue placeholder="Select batch" />
          </SelectTrigger>
          <SelectContent>
            {batches?.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date"
              className="w-full justify-between font-normal rounded-xs shadow-none dark:bg-background dark:hover:bg-background"
              disabled={isPending}
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </FormCardWrapper>

      <Collapsible open={(students?.length ?? 0) > 0 && date != undefined}>
        <CollapsibleContent>
          <CardWrapper
            title={`${presentCount} of ${students?.length} present`}
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
                variant={!allPresent ? "secondary" : "ghost"}
                onClick={markAllAbsent}
              >
                Mark All Absent
              </Button>
              {presentCount > 0 && (
                <Button
                  size="sm"
                  className="rounded-full"
                  variant="destructive"
                  onClick={() => setAttendances([])}
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
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student) => {
                  const isPresent = isStudentPresent(student.id);
                  return (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleStudent(student.id)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isPresent}
                          onCheckedChange={() => toggleStudent(student.id)}
                          aria-label={`Mark ${student.name} as present`}
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.mPhone}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            student?.salaryPayments?.length > 0
                              ? "destructive"
                              : "default"
                          }
                          className="rounded-full"
                        >
                          {student?.salaryPayments?.length}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <LoadingButton
              type="button"
              onClick={handleSubmit}
              loadingText="Submitting..."
              successText="Submitted!"
              errorText={errorText || "Failed"}
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full rounded-full"
              icon={Send}
              disabled={attendances.length === 0}
            >
              Submit
            </LoadingButton>
          </CardWrapper>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
