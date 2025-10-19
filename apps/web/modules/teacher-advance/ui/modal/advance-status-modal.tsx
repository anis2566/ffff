"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import {
  TeacherAdvanceStatusSchema,
  TeacherAdvanceStatusSchemaType,
} from "@workspace/utils/schemas";
import { TEACHER_ADVANCE_STATUS } from "@workspace/utils/constant";

import { useGetAdvances } from "../../filters/use-get-advances";
import { useAdvanceStatus } from "@/hooks/use-teacher-advance";

export const AdvanceStatusModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const [filters] = useGetAdvances();
  const queryClient = useQueryClient();
  const { isOpen, advanceId, status, onClose } = useAdvanceStatus();

  useEffect(() => {
    form.setValue("status", status);
  }, [status]);

  const { mutate: updateStatus, isPending } = useMutation(
    trpc.teacherAdvance.changeStatus.mutationOptions({
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
          trpc.teacherAdvance.getMany.queryOptions({ ...filters })
        );
        form.reset({
          status: "",
        });
        onClose();
      },
    })
  );

  const form = useForm<TeacherAdvanceStatusSchemaType>({
    resolver: zodResolver(TeacherAdvanceStatusSchema),
    defaultValues: {
      status: "",
    },
  });

  const onSubmit = (data: TeacherAdvanceStatusSchemaType) => {
    setButtonState("loading");
    updateStatus({
      ...data,
      id: advanceId,
    });
  };

  return (
    <Dialog
      open={isOpen && !!advanceId}
      onOpenChange={isPending ? () => {} : onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Status</DialogTitle>
          <DialogDescription>
            Update the status of the advance
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              form={form}
              name="status"
              label="Status"
              placeholder="Select status"
              disabled={isPending}
              options={Object.values(TEACHER_ADVANCE_STATUS)
                .slice(1, 4)
                .map((status) => ({
                  label: status,
                  value: status,
                }))}
            />
            <LoadingButton
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Updating..."
              successText="Updated!"
              errorText={errorText || "Failed"}
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full rounded-full"
              icon={Send}
            >
              Update
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
