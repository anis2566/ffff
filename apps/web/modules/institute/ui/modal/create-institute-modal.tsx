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
import { INSTITUTE_TYPES } from "@workspace/utils/constant";

import { useGetInstitutes } from "../../filters/use-get-institutes";
import { useCreateInstitute } from "@/hooks/use-institute";

export const CreateInstituteModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose } = useCreateInstitute();
  const trpc = useTRPC();
  const [filters] = useGetInstitutes();
  const queryClient = useQueryClient();

  const { mutate: createInstitute, isPending } = useMutation(
    trpc.institute.createOne.mutationOptions({
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
          trpc.institute.getMany.queryOptions({ ...filters })
        );
        form.reset({
          type: "",
          name: "",
        });
        onClose();
      },
    })
  );

  const form = useForm<InstituteSchemaType>({
    resolver: zodResolver(InstituteSchema),
    defaultValues: {
      type: "",
      name: "",
    },
  });

  const onSubmit = (data: InstituteSchemaType) => {
    setButtonState("loading");
    createInstitute(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
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
              name="type"
              label="Type"
              placeholder="Select type"
              disabled={isPending}
              options={Object.values(INSTITUTE_TYPES).map((type) => ({
                value: type,
                label: type,
              }))}
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
