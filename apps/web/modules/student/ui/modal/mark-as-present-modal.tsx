"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { useMarkPesentStudent } from "@/hooks/use-student";
import { useGetAbsentStudents } from "../../filters/use-get-absent-students";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import { FormSelect } from "@workspace/ui/shared/form-select";

const formSchema = z.object({
  batchId: z.string(),
});

export const MarkAsPresentModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, studentId, classNameId, onClose } = useMarkPesentStudent();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [absentFilters] = useGetAbsentStudents();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchId: "",
    },
  });

  const { data: batches } = useQuery(
    trpc.batch.getByClass.queryOptions(classNameId)
  );

  const batchData = (batches ?? []).map((batch) => ({
    label: batch.name,
    value: batch.id,
  }));

  const { mutate: markPresent, isPending } = useMutation(
    trpc.student.markAsPresent.mutationOptions({
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
          queryKey: trpc.student.getMany.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.student.getAbsentMany.queryKey(absentFilters),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    markPresent({ studentId, batchId: data.batchId });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && buttonState === "idle") {
      onClose();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up your room</DialogTitle>
          <DialogDescription>
            This information will be used to create your room.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormSelect
              form={form}
              name="batchId"
              label="Batch"
              placeholder="Select Batch"
              options={batchData}
              disabled={isPending}
            />
            <LoadingButton
              type="submit"
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full rounded-full"
              icon={Send}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
