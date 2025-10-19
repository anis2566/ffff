"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import {
  UtilityPaymentSchema,
  UtilityPaymentSchemaType,
} from "@workspace/utils/schemas";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { FormInput } from "@workspace/ui/shared/form-input";

import { useGetPayments } from "../../filters/use-get-payments";

export const NewUtilityPaymentForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetPayments();

  const { mutate: createPayment, isPending } = useMutation(
    trpc.utilityPayment.createOne.mutationOptions({
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
          trpc.utilityPayment.getMany.queryOptions({ ...filters })
        );
        router.push("/expense/utility");
      },
    })
  );

  const form = useForm<UtilityPaymentSchemaType>({
    resolver: zodResolver(UtilityPaymentSchema),
    defaultValues: {
      name: "",
      amount: "",
    },
  });

  const onSubmit = (data: UtilityPaymentSchemaType) => {
    setButtonState("loading");
    createPayment(data);
  };

  return (
    <FormCardWrapper
      title="Set Up Your Payment"
      description="Enter the payment information to get started quickly."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            form={form}
            name="name"
            label="Name"
            type="text"
            disabled={isPending}
          />
          <FormInput
            form={form}
            name="amount"
            label="Amount"
            type="number"
            disabled={isPending}
          />
          <LoadingButton
            type="submit"
            onClick={form.handleSubmit(onSubmit)}
            loadingText="Saving..."
            successText="Saved!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto rounded-full"
            icon={Send}
          >
            Save
          </LoadingButton>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
