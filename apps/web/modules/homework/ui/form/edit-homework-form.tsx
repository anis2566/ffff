"use client";

import { Homework } from "@workspace/db";
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

interface HomeworkWithRelations extends Homework {
  student: {
    name: string;
    studentId: number;
    mPhone: string;
    id: string;
  };
}

interface EditStudentHomeworkFormProps {
  homeworkRecords: HomeworkWithRelations[];
  id: string;
}

export default function EditHomeWorkForm({
  homeworkRecords,
  id,
}: EditStudentHomeworkFormProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    setSelectedIds(
      homeworkRecords
        .filter((record) => record.hasFinished === true)
        .map((record) => record.id)
    );
  }, [homeworkRecords]);

  const { mutate: updateHomework, isPending } = useMutation(
    trpc.homework.updateMany.mutationOptions({
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
        await queryClient.invalidateQueries({
          queryKey: trpc.homework.getMany.queryKey(),
        });
        router.push(`/homework`);
      },
    })
  );

  const completedCount = selectedIds.length;
  const allCompleted =
    homeworkRecords.length > 0 && completedCount === homeworkRecords.length;
  const someCompleted =
    completedCount > 0 && completedCount < homeworkRecords.length;

  const isHomeworkCompleted = (homeworkId: string) => {
    return selectedIds.includes(homeworkId);
  };

  const toggleHomework = (homeworkId: string) => {
    setSelectedIds((prev) =>
      prev.includes(homeworkId)
        ? prev.filter((id) => id !== homeworkId)
        : [...prev, homeworkId]
    );
  };

  const toggleAll = () => {
    if (allCompleted) {
      setSelectedIds([]);
    } else {
      setSelectedIds(homeworkRecords.map((record) => record.id));
    }
  };

  const markAllCompleted = () => {
    setSelectedIds(homeworkRecords.map((record) => record.id));
  };

  const markAllIncomplete = () => {
    setSelectedIds([]);
  };

  const handleSubmit = () => {
    updateHomework({
      ids: selectedIds,
      homeworkId: id,
    });
  };

  return (
    <CardWrapper
      title={`${completedCount} of ${homeworkRecords?.length} completed`}
      contentClassName="space-y-4"
    >
      <div className="flex items-center gap-4">
        <Button
          size="sm"
          variant={allCompleted ? "secondary" : "ghost"}
          onClick={markAllCompleted}
        >
          Mark All Completed
        </Button>
        <Button
          size="sm"
          variant={
            !allCompleted && completedCount === 0 ? "secondary" : "ghost"
          }
          onClick={markAllIncomplete}
        >
          Mark All Incomplete
        </Button>
        {someCompleted && (
          <Button
            size="sm"
            className="rounded-full"
            variant="destructive"
            onClick={markAllIncomplete}
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
                checked={allCompleted}
                onCheckedChange={toggleAll}
                aria-label="Select all students"
                className={someCompleted ? "opacity-50" : ""}
                disabled={isPending}
              />
            </TableHead>
            <TableHead>#ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {homeworkRecords?.map((homework) => {
            const isCompleted = isHomeworkCompleted(homework.id);
            return (
              <TableRow
                key={homework.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => toggleHomework(homework.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={() => toggleHomework(homework.id)}
                    aria-label={`Mark ${homework.student.name} as completed`}
                    disabled={isPending}
                  />
                </TableCell>
                <TableCell>{homework.student.studentId}</TableCell>
                <TableCell>{homework.student.name}</TableCell>
                <TableCell>{homework.student.mPhone}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <LoadingButton
        type="button"
        state={buttonState}
        onStateChange={setButtonState}
        className="w-full rounded-full"
        icon={Send}
        disabled={selectedIds.length === 0}
        onClick={handleSubmit}
      >
        Update
      </LoadingButton>
    </CardWrapper>
  );
}
