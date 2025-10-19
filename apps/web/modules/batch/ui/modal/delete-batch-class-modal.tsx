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

import { useDeleteBatchClass } from "@/hooks/use-batch-class";

export const DeleteBatchClassModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, classId, batchId, onClose, teacherId } =
    useDeleteBatchClass();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: deleteBatchClass } = useMutation(
    trpc.batchClass.deleteOne.mutationOptions({
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
          trpc.batchClass.getByBatch.queryOptions(batchId!)
        );
        if (teacherId) {
          queryClient.invalidateQueries(
            trpc.batchClass.getByTeacher.queryOptions(teacherId)
          );
        }
        onClose();
      },
    })
  );

  const handleDelete = () => {
    setButtonState("loading");
    deleteBatchClass(classId!);
  };

  return (
    <AlertDialog open={isOpen && !!batchId && !!classId} onOpenChange={onClose}>
      <AlertDialogContent className="rounded-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            batch class and remove your data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <LoadingButton
            type="submit"
            onClick={handleDelete}
            loadingText="Deleting..."
            successText="Deleted!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto"
            variant="destructive"
            icon={Send}
          >
            Delete
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
