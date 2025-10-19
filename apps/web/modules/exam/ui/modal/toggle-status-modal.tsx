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

import { useToggleResultStatus } from "@/hooks/use-result";
import { useGetExamResults } from "../../filters/use-get-exam-results";
import { EXAM_STATUS } from "@workspace/utils/constant";

export const ToggleStatusModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, resultId, status, onClose } = useToggleResultStatus();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [filters] = useGetExamResults();

  const { mutate: toggleStatus, isPending } = useMutation(
    trpc.examResult.toggleStatus.mutationOptions({
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
          trpc.examResult.getMany.queryOptions({ ...filters })
        );
        onClose();
      },
    })
  );

  const handleDelete = () => {
    setButtonState("loading");
    toggleStatus(resultId);
  };

  return (
    <AlertDialog
      open={isOpen && !!resultId}
      onOpenChange={isPending ? () => {} : onClose}
    >
      <AlertDialogContent className="rounded-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will change the status of the
            result {status} to{" "}
            {status === EXAM_STATUS.Published
              ? EXAM_STATUS.Unpublished
              : EXAM_STATUS.Published}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <LoadingButton
            type="submit"
            onClick={handleDelete}
            loadingText="Updating..."
            successText="Updated!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto"
            variant="default"
            icon={Send}
          >
            Update
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
