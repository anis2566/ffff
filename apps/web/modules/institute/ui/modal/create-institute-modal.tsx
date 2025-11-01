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

import { InstituteSchema, InstituteSchemaType } from "@workspace/utils/schemas";
import { INSTITUTE_TYPES, Session } from "@workspace/utils/constant";

import { useCreateInstitute } from "@/hooks/use-institute";

const DEFAULT_VALUES: InstituteSchemaType = {
  session: "",
  type: "",
  name: "",
};

const INSTITUTE_TYPES_OPTIONS = Object.values(INSTITUTE_TYPES).map((type) => ({
  label: type,
  value: type,
}));

export const CreateInstituteModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateInstitute();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<InstituteSchemaType>({
    resolver: zodResolver(InstituteSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate: createInstitute, isPending } = useMutation(
    trpc.institute.createOne.mutationOptions({
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
          queryKey: trpc.institute.getMany.queryKey(),
        });
        form.reset(DEFAULT_VALUES);

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: InstituteSchemaType) => {
    createInstitute(data);
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
          <DialogTitle>Set up your institute</DialogTitle>
          <DialogDescription>
            This information will be used to create your institute.
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
            <FormSelect
              form={form}
              name="type"
              label="Type"
              placeholder="Select type"
              disabled={isPending}
              options={INSTITUTE_TYPES_OPTIONS}
            />
            <FormInput
              form={form}
              name="name"
              label="Name"
              disabled={isPending}
              type="text"
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
