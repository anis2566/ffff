"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useState } from "react";

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
import { LEVELS, Session } from "@workspace/utils/constant";

import { useCreateClass } from "@/hooks/use-class";

const DEFAULT_VALUES: ClassNameSchemaType = {
  session: "",
  name: "",
  level: "",
  position: "",
};

const LEVEL_OPTIONS = Object.values(LEVELS).map((level) => ({
  label: level,
  value: level,
}));

export const CreateClassModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateClass();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<ClassNameSchemaType>({
    resolver: zodResolver(ClassNameSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate: createClass } = useMutation(
    trpc.class.createOne.mutationOptions({
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
          queryKey: trpc.class.getAll.queryKey(),
        });

        form.reset(DEFAULT_VALUES);
        onClose();
      },
    })
  );

  const handleSubmit = (data: ClassNameSchemaType) => {
    createClass(data);
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
          <DialogTitle>Set up your class</DialogTitle>
          <DialogDescription>
            This information will be used to create your class.
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
              placeholder="Enter class name"
            />

            <FormSelect
              form={form}
              name="level"
              label="Level"
              placeholder="Select level"
              options={LEVEL_OPTIONS}
              triggerClassName="w-full"
            />

            <FormInput
              form={form}
              name="position"
              label="Position"
              placeholder="Enter position number"
              type="number"
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
