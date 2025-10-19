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

import { useToggleFinished } from "@/hooks/use-document";

export const ToggleFinishedModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, hasFinished, documentId, onClose } = useToggleFinished();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: toggleStatus, isPending } = useMutation(
    trpc.document.toggleFinished.mutationOptions({
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
        queryClient.invalidateQueries({
          queryKey: trpc.document.getMany.queryKey(),
        });
        onClose();
      },
    })
  );

  const handleToggle = () => {
    setButtonState("loading");
    toggleStatus(documentId);
  };

  return (
    <AlertDialog
      open={isOpen && !!documentId}
      onOpenChange={isPending ? () => {} : onClose}
    >
      <AlertDialogContent className="rounded-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will change the{" "}
            {hasFinished ? "finished" : "not finished"} to{" "}
            {hasFinished ? "not finished" : "finished"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <LoadingButton
            type="submit"
            onClick={handleToggle}
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
