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

import { InstituteSchema, InstituteSchemaType } from "@workspace/utils/schemas";
import { INSTITUTE_TYPES, Session } from "@workspace/utils/constant";

import { useEditInstitute } from "@/hooks/use-institute";

const INSTITUTE_TYPES_OPTIONS = Object.values(INSTITUTE_TYPES).map((v) => ({
  label: v,
  value: v,
}));

export const EditInstituteModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, instituteId, session, type, name } =
    useEditInstitute();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<InstituteSchemaType>({
    resolver: zodResolver(InstituteSchema),
    defaultValues: {
      session: "",
      type: "",
      name: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        session,
        type,
        name,
      });
    }
  }, [isOpen, form, session, type, name]);

  const { mutate: updateInstitute, isPending } = useMutation(
    trpc.institute.updateOne.mutationOptions({
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

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: InstituteSchemaType) => {
    updateInstitute({
      ...data,
      id: instituteId,
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
          <DialogTitle>Edit Institute</DialogTitle>
          <DialogDescription>
            Make changes to your institute details. Do not forget to save when
            you are done.
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
              Update
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
