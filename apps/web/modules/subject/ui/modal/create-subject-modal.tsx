"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { SubjectSchema, SubjectSchemaType } from "@workspace/utils/schemas";
import { GROUPS, LEVELS, Session } from "@workspace/utils/constant";

import { useCreateSubject } from "@/hooks/use-subject";

const DEFAULT_VALUES: SubjectSchemaType = {
  session: "",
  name: "",
  level: "",
  group: "",
};

const LEVEL_OPTIONS = Object.values(LEVELS).map((level) => ({
  label: level,
  value: level,
}));
const GROUP_OPTIONS = Object.values(GROUPS).map((group) => ({
  label: group,
  value: group,
}));

export const CreateSubjectModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateSubject();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<SubjectSchemaType>({
    resolver: zodResolver(SubjectSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate: createSubject, isPending } = useMutation(
    trpc.subject.createOne.mutationOptions({
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
          queryKey: trpc.subject.getMany.queryKey(),
        });

        setTimeout(() => {
          form.reset(DEFAULT_VALUES);
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: SubjectSchemaType) => {
    createSubject(data);
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
          <DialogTitle>Set up your subject</DialogTitle>
          <DialogDescription>
            This information will be used to create your subject.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              form={form}
              name="session"
              label="Session"
              placeholder="Select session"
              options={Session}
              triggerClassName="w-full"
            />
            <FormInput
              form={form}
              name="name"
              label="Name"
              disabled={isPending}
              type="text"
            />
            <FormSelect
              form={form}
              name="level"
              label="Level"
              placeholder="Select level"
              disabled={isPending}
              options={LEVEL_OPTIONS}
            />
            <FormSelect
              form={form}
              name="group"
              label="Group"
              placeholder="Select group"
              disabled={isPending}
              options={GROUP_OPTIONS}
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
