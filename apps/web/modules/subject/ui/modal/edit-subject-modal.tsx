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
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { SubjectSchema, SubjectSchemaType } from "@workspace/utils/schemas";
import { GROUPS, LEVELS, Session } from "@workspace/utils/constant";

import { useEditSubject } from "@/hooks/use-subject";

const LEVEL_OPTIONS = Object.values(LEVELS).map((level) => ({
  label: level,
  value: level,
}));

const GROUP_OPTIONS = Object.values(GROUPS).map((group) => ({
  label: group,
  value: group,
}));

export const EditSubjectModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, subjectId, session, name, level, group } =
    useEditSubject();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<SubjectSchemaType>({
    resolver: zodResolver(SubjectSchema),
    defaultValues: {
      session: "",
      name: "",
      level: "",
      group: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        session,
        name,
        level,
        group,
      });
    }
  }, [isOpen, form, name, level, group, session]);

  const { mutate: updateSubject, isPending } = useMutation(
    trpc.subject.updateOne.mutationOptions({
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
          onClose();
        }, 2000);
      },
    })
  );

  const handleSubmit = (data: SubjectSchemaType) => {
    setButtonState("loading");
    updateSubject({
      ...data,
      id: subjectId,
    });
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
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Make changes to your subject details. Do not forget to save when you
            are done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
              Update
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
