"use client";

import { useMarkAbsentStudent } from "@/hooks/use-student";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { useGetStudents } from "../../filters/use-get-students";
import { StudentDeactivationReasons } from "@workspace/utils/constant";

export const MarkAsAbsentModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const { isOpen, studentId, onClose } = useMarkAbsentStudent();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [filters] = useGetStudents();

  const { mutate: markAsAbsent, isPending } = useMutation(
    trpc.student.markAsAbsent.mutationOptions({
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
        onClose();
      },
    })
  );

  const handleTransfer = () => {
    setButtonState("loading");
    markAsAbsent(studentId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Student Deactivation</DialogTitle>
          <DialogDescription>Mark studnet as absent</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Reason</Label>
            <Select onValueChange={(reason) => setReason(reason)} disabled={isPending}>
              <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {StudentDeactivationReasons.map((item, index) => (
                  <SelectItem value={item} key={index}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <LoadingButton
            type="submit"
            onClick={handleTransfer}
            loadingText="Submitting..."
            successText="Submitted!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full rounded-full"
            variant="default"
            icon={Send}
            disabled={!reason}
          >
            Submit
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
