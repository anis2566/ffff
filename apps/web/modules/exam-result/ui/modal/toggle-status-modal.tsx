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
import { EXAM_STATUS } from "@workspace/utils/constant";

export const ToggleResultStatusModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, resultId, status, onClose } = useToggleResultStatus();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: toggleStatus, isPending } = useMutation(
    trpc.examResult.toggleStatus.mutationOptions({
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

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleUpdate = () => {
    toggleStatus(resultId);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && buttonState === "idle") {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen && !!resultId} onOpenChange={handleOpenChange}>
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
            type="button"
            state={buttonState}
            onStateChange={setButtonState}
            icon={Send}
            onClick={handleUpdate}
          >
            Update
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
