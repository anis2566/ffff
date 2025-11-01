"use client";

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

type ExamResultRecord = {
  resultId: string;
  studentId: string;
  selected: boolean;
};

interface ExamResultWithRelations {
  id: string;
  student: {
    name: string;
    studentId: number;
    mPhone: string;
    id: string;
  };
}

interface EditExamResultFormProps {
  examResults: ExamResultWithRelations[];
  resultId: string;
  allStudents: {
    id: string;
    name: string;
    studentId: number;
    mPhone: string;
  }[];
}

export default function EditExamResultForm({
  examResults,
  resultId,
  allStudents,
}: EditExamResultFormProps) {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setSelectedStudents(examResults.map((record) => record.student.id));
  }, [examResults]);

  const { mutate: updateExamResults, isPending } = useMutation(
    trpc.examResult.updateMany.mutationOptions({
      onMutate: () => {
        setButtonState("loading");
      },
      onError: (err) => {
        setButtonState("error");
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          setButtonState("error");
          toast.error(data.message);
          return;
        }
        setButtonState("success");
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: trpc.examResult.getMany.queryKey(),
        });
        router.push(`/exam/result`);
      },
    })
  );

  const selectedCount = selectedStudents.length;

  const allSelected =
    allStudents &&
    allStudents.length > 0 &&
    selectedCount === allStudents.length;

  const someSelected =
    selectedCount > 0 && selectedCount < (allStudents?.length || 0);

  const isStudentSelected = (studentId: string) => {
    return selectedStudents.includes(studentId);
  };

  const toggleStudent = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    } else {
      setSelectedStudents((prev) => [...prev, studentId]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(allStudents.map((s) => s.id));
    }
  };

  const markAllSelected = () => {
    setSelectedStudents(allStudents.map((s) => s.id));
  };

  const markAllUnselected = () => {
    setSelectedStudents([]);
  };

  const handleSubmit = () => {
    updateExamResults({
      resultId,
      studentIds: selectedStudents,
    });
  };

  return (
    <CardWrapper
      title={`${selectedCount} of ${allStudents?.length} selected`}
      contentClassName="space-y-4"
    >
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant={allSelected ? "secondary" : "ghost"}
          onClick={markAllSelected}
          disabled={isPending}
        >
          Select All
        </Button>
        <Button
          size="sm"
          variant={!allSelected && selectedCount === 0 ? "secondary" : "ghost"}
          onClick={markAllUnselected}
          disabled={isPending}
        >
          Unselect All
        </Button>
        {selectedCount > 0 && selectedCount < allStudents.length && (
          <Button
            size="sm"
            className="rounded-full"
            variant="destructive"
            onClick={markAllUnselected}
            disabled={isPending}
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
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all students"
                className={someSelected ? "opacity-50" : ""}
                disabled={isPending}
              />
            </TableHead>
            <TableHead>#ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allStudents?.map((student) => {
            const isSelected = isStudentSelected(student.id);
            return (
              <TableRow
                key={student.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggleStudent(student.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleStudent(student.id)}
                    aria-label={`Select ${student.name}`}
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell>{student.studentId}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.mPhone}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <LoadingButton
        type="submit"
        state={buttonState}
        onStateChange={setButtonState}
        className="w-full rounded-full"
        icon={Send}
      >
        Update
      </LoadingButton>
    </CardWrapper>
  );
}
