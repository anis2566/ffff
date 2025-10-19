"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { useGetStudents } from "../../filters/use-get-students";
import { useMarkPesentStudent } from "@/hooks/use-student";
import { useGetAbsentStudents } from "../../filters/use-get-absent-students";

export const MarkAsPresentModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, studentId, onClose } = useMarkPesentStudent();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [filters] = useGetStudents();
  const [absentFilters] = useGetAbsentStudents();

  const { mutate: markPresent, isPending } = useMutation(
    trpc.student.markAsPresent.mutationOptions({
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
          trpc.student.getMany.queryOptions({ ...filters })
        );
        queryClient.invalidateQueries(
          trpc.student.getAbsentMany.queryOptions({ ...absentFilters })
        );
        onClose();
      },
    })
  );

  const handleMarkPresent = () => {
    setButtonState("loading");
    markPresent(studentId);
  };

  return (
    <AlertDialog
      open={isOpen && !!studentId}
      onOpenChange={isPending ? () => {} : onClose}
    >
      <AlertDialogContent className="rounded-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will activate the student.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <LoadingButton
            type="submit"
            onClick={handleMarkPresent}
            loadingText="Submitting..."
            successText="Submitted!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto"
            variant="default"
            icon={Send}
          >
            Submit
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
