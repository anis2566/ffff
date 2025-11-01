"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { MONTH, PAYMENT_METHOD } from "@workspace/utils/constant";
import {
  HousePaymentSchema,
  HousePaymentSchemaType,
} from "@workspace/utils/schemas";
import { FormInput } from "@workspace/ui/shared/form-input";

const PAYMENT_METHOD_OPTIONS = Object.values(PAYMENT_METHOD).map((v) => ({
  value: v,
  label: v,
}));
const MONTH_OPTIONS = Object.values(MONTH).map((v) => ({
  label: v,
  value: v,
}));

export const NewHousePaymentForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<HousePaymentSchemaType>({
    resolver: zodResolver(HousePaymentSchema),
    defaultValues: {
      houseId: "",
      month: "",
      amount: "",
      method: PAYMENT_METHOD.Cash,
    },
  });

  const { data: houses } = useQuery(
    trpc.house.forSelect.queryOptions({ query: "" })
  );

  const houseOptions = (houses || []).map((house) => ({
    value: house.id,
    label: house.name,
  }));

  const { mutate: createPayment, isPending } = useMutation(
    trpc.housePayment.createOne.mutationOptions({
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
          queryKey: trpc.housePayment.getMany.queryKey(),
        });
        router.push("/expense/house");
      },
    })
  );

  const onSubmit = (value: HousePaymentSchemaType) => {
    createPayment(value);
  };

  return (
    <FormCardWrapper
      title="Set Up Your Payment"
      description="Enter the payment information to get started quickly."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            form={form}
            name="houseId"
            label="House"
            placeholder="Select House"
            options={houseOptions}
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="month"
            label="Month"
            placeholder="Select month"
            options={MONTH_OPTIONS}
            disabled={isPending}
          />
          <FormInput
            form={form}
            name="amount"
            label="Amount"
            type="number"
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="method"
            label="Method"
            placeholder="Select method"
            options={PAYMENT_METHOD_OPTIONS}
            disabled={isPending}
          />
          <LoadingButton
            type="submit"
            state={buttonState}
            onStateChange={setButtonState}
            className="rounded-full"
            icon={Send}
          >
            Submit
          </LoadingButton>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
