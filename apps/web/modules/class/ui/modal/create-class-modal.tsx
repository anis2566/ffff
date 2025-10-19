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

import { ClassNameSchema, ClassNameSchemaType } from "@workspace/utils/schemas";
import { LEVELS } from "@workspace/utils/constant";

import { useCreateClass } from "@/hooks/use-class";
import { useGetClasses } from "../../filters/use-get-classes";

export const CreateClassModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose } = useCreateClass();
  const trpc = useTRPC();
  const [filters] = useGetClasses();
  const queryClient = useQueryClient();

  const { mutate: createClass, isPending } = useMutation(
    trpc.class.createOne.mutationOptions({
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
          trpc.class.getAll.queryOptions({ ...filters })
        );
        form.reset({
          name: "",
          level: "",
          position: "",
        })
        onClose();
      },
    })
  );

  const form = useForm<ClassNameSchemaType>({
    resolver: zodResolver(ClassNameSchema),
    defaultValues: {
      name: "",
      level: "",
      position: "",
    },
  });

  const onSubmit = (data: ClassNameSchemaType) => {
    setButtonState("loading");
    createClass(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up your class</DialogTitle>
          <DialogDescription>
            This information will be used to create your class.
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
            <FormInput
              form={form}
              name="position"
              label="Position"
              disabled={isPending}
              type="number"
            />
            <LoadingButton
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Submitting..."
              successText="Submitted!"
              errorText={errorText || "Failed"}
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
