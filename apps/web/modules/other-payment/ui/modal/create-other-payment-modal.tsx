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
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { OtherPayment, OtherPaymentType } from "@workspace/utils/schemas";

import { useCreateIncome } from "@/hooks/use-other-income";

const DEFAULT_VALUES: OtherPaymentType = {
  name: "",
  amount: "",
};

export const CreateIncomeModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateIncome();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<OtherPaymentType>({
    resolver: zodResolver(OtherPayment),
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate: createPayment, isPending } = useMutation(
    trpc.otherPayment.createOne.mutationOptions({
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
          queryKey: trpc.otherPayment.getMany.queryKey(),
        });

        setTimeout(() => {
          form.reset(DEFAULT_VALUES);
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: OtherPaymentType) => {
    createPayment(data);
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
          <DialogTitle>Set up your payment</DialogTitle>
          <DialogDescription>
            This information will be used to create your payment.
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
