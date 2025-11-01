"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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

import { useActiveTeacher } from "@/hooks/use-teacher";

export const ActiveTeacherModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, teacherId, onClose } = useActiveTeacher();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: deleteTeacher, isPending } = useMutation(
    trpc.teacher.active.mutationOptions({
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
          queryKey: trpc.teacher.getMany.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleActive = () => {
    deleteTeacher({ teacherId });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && buttonState === "idle") {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen && !!teacherId} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="rounded-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently activate your
            teacher and remove your data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <LoadingButton
            onClick={handleActive}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto"
            icon={Check}
          >
            Active
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
