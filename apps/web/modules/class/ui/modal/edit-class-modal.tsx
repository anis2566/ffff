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

import { ClassNameSchema, ClassNameSchemaType } from "@workspace/utils/schemas";
import { LEVELS, Session } from "@workspace/utils/constant";

import { useEditClass } from "@/hooks/use-class";
import { useGetClasses } from "../../filters/use-get-classes";

const LEVEL_OPTIONS = Object.values(LEVELS).map((level) => ({
  label: level,
  value: level,
}));

export const EditClassModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, classId, session, name, level, position } =
    useEditClass();
  const trpc = useTRPC();
  const [filters] = useGetClasses();
  const queryClient = useQueryClient();

  const form = useForm<ClassNameSchemaType>({
    resolver: zodResolver(ClassNameSchema),
    defaultValues: {
      session: "",
      name: "",
      level: "",
      position: "",
    },
  });

  // Update form values when modal opens with class data
  useEffect(() => {
    if (isOpen) {
      form.reset({
        session,
        name,
        level,
        position,
      });
    }
  }, [isOpen, session, name, level, position, form]);

  const { mutate: updateClass } = useMutation(
    trpc.class.updateOne.mutationOptions({
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

        await queryClient.invalidateQueries(
          trpc.class.getAll.queryOptions({ ...filters })
        );

        onClose();
      },
    })
  );

  const handleSubmit = (data: ClassNameSchemaType) => {
    updateClass({
      ...data,
      classId,
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
          <DialogTitle>Edit Class</DialogTitle>
          <DialogDescription>
            Make changes to your class details. Click save when you are done.
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
              Update
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
