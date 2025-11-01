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

import { useDeleteAdmissionFee } from "@/hooks/use-admission-fee";

export const DeleteAdmisssionFeeModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, feeId, onClose } = useDeleteAdmissionFee();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: deleteAdmissionFee, isPending } = useMutation(
    trpc.admissionFee.deleteOne.mutationOptions({
      onMutate: () => {
        setButtonState("loading");
      },
      onError: (err) => {
        setButtonState("error");
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          toast.error(data.message);
          return;
        }
        setButtonState("success");
        toast.success(data.message);
        queryClient.invalidateQueries({
          queryKey: trpc.admissionFee.getMany.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleDelete = () => {
    deleteAdmissionFee(feeId);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && buttonState === "idle") {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen && !!feeId} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            admission fee and remove your data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
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
