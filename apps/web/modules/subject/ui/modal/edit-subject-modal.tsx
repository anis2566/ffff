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
import { GROUPS, LEVELS } from "@workspace/utils/constant";

import { useGetSubjects } from "../../filters/use-get-subjects";
import { useEditSubject } from "@/hooks/use-subject";

export const EditSubjectModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose, subjectId, name, level, group } = useEditSubject();
  const trpc = useTRPC();
  const [filters] = useGetSubjects();
  const queryClient = useQueryClient();

  useEffect(() => {
    form.setValue("name", name);
    form.setValue("level", level);
    form.setValue("group", group);
  }, [name, level, group]);

  const { mutate: updateSubject, isPending } = useMutation(
    trpc.subject.updateOne.mutationOptions({
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
          trpc.subject.getMany.queryOptions({ ...filters })
        );
        onClose();
      },
    })
  );

  const form = useForm<SubjectSchemaType>({
    resolver: zodResolver(SubjectSchema),
    defaultValues: {
      name: "",
      level: "",
      group: "",
    },
  });

  const onSubmit = (data: SubjectSchemaType) => {
    setButtonState("loading");
    updateSubject({
      ...data,
      id: subjectId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
          <DialogDescription>
            Make changes to your subject details. Do not forget to save when you
            are done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              options={Object.values(LEVELS).map((level) => ({
                label: level,
                value: level,
              }))}
            />
            <FormSelect
              form={form}
              name="group"
              label="Group"
              placeholder="Select group"
              disabled={isPending}
              options={Object.values(GROUPS).map((level) => ({
                label: level,
                value: level,
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
