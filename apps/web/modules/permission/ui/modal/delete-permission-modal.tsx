"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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

import { useDeleteClass } from "@/hooks/use-class";

export const DeleteClassModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, classId, onClose } = useDeleteClass();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: deleteClass } = useMutation(
    trpc.class.deleteOne.mutationOptions({
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
          queryKey: trpc.class.getAll.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleDelete = () => {
    deleteClass({ id: classId });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && buttonState === "idle") {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen && !!classId} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            class and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={buttonState !== "idle"}>
            Cancel
          </AlertDialogCancel>
          <LoadingButton
            onClick={handleDelete}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto"
            variant="destructive"
            icon={Trash2}
          >
            Delete
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
