"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import {
  AdmissionFeeSchema,
  AdmissionFeeSchemaType,
} from "@workspace/utils/schemas";

import { useCreateAdmissionFee } from "@/hooks/use-admission-fee";
import { Session } from "@workspace/utils/constant";

const DEFAULT_VALUES: AdmissionFeeSchemaType = {
  session: "",
  classNameId: "",
  amount: "",
};

export const CreateAdmissionFeeModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateAdmissionFee();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<AdmissionFeeSchemaType>({
    resolver: zodResolver(AdmissionFeeSchema),
    defaultValues: {
      session: "",
      classNameId: "",
      amount: "",
    },
  });

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: createAdmissionFee, isPending } = useMutation(
    trpc.admissionFee.createOne.mutationOptions({
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
          queryKey: trpc.admissionFee.getMany.queryKey(),
        });
        form.reset(DEFAULT_VALUES);

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: AdmissionFeeSchemaType) => {
    createAdmissionFee(data);
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
          <DialogTitle>Set up your fee</DialogTitle>
          <DialogDescription>
            This information will be used to create your admission fee.
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
              name="classNameId"
              label="Class"
              placeholder="Select class"
              disabled={isPending}
              options={
                classes?.map((classItem) => ({
                  label: classItem.name,
                  value: classItem.id,
                })) || []
              }
            />
            <FormInput
              form={form}
              name="amount"
              label="Amount"
              disabled={isPending}
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
