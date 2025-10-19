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

import { useDeleteStudentAttendance } from "@/hooks/use-student-attendance";
import { useGetStudentAttendances } from "../../filters/use-get-student-attendances";

export const DeleteAttendanceModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, attendanceId, onClose } = useDeleteStudentAttendance();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [filters] = useGetStudentAttendances();

  const { mutate: deleteAttendance, isPending } = useMutation(
    trpc.studentAttendance.deleteOne.mutationOptions({
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
          trpc.studentAttendance.getMany.queryOptions({ ...filters })
        );
        onClose();
      },
    })
  );

  const handleDelete = () => {
    setButtonState("loading");
    deleteAttendance(attendanceId);
  };

  return (
    <AlertDialog
      open={isOpen && !!attendanceId}
      onOpenChange={isPending ? () => {} : onClose}
    >
      <AlertDialogContent className="rounded-xs">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            attendance and remove your data from servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
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
