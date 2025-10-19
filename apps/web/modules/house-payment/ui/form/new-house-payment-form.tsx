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
import {
  MONTH,
  PAYMENT_METHOD,
  SALARY_PAYMENT_STATUS,
} from "@workspace/utils/constant";
import {
  HousePaymentSchema,
  HousePaymentSchemaType,
} from "@workspace/utils/schemas";
import { FormInput } from "@workspace/ui/shared/form-input";
import { useGetPayments } from "../../filters/use-get-payments";

export const NewHousePaymentForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetPayments();

  const { data: houses } = useQuery(
    trpc.house.forSelect.queryOptions({ query: "" })
  );

  const { mutate: createPayment, isPending } = useMutation(
    trpc.housePayment.createOne.mutationOptions({
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
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.housePayment.getMany.queryOptions({ ...filters })
          ),
        ]);
        router.push("/expense/house");
      },
    })
  );

  const form = useForm<HousePaymentSchemaType>({
    resolver: zodResolver(HousePaymentSchema),
    defaultValues: {
      houseId: "",
      month: "",
      amount: "",
      method: PAYMENT_METHOD.Cash,
      paymentStatus: SALARY_PAYMENT_STATUS.Paid,
    },
  });

  const onSubmit = (value: HousePaymentSchemaType) => {
    setButtonState("loading");
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
            options={
              houses?.map((house) => ({
                label: house.name,
                value: house.id,
              })) || []
            }
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="month"
            label="Month"
            placeholder="Select month"
            options={Object.values(MONTH).map((month) => ({
              label: month,
              value: month,
            }))}
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
            options={Object.values(PAYMENT_METHOD).map((month) => ({
              label: month,
              value: month,
            }))}
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="paymentStatus"
            label="P. Status"
            placeholder="Select status"
            options={Object.values(SALARY_PAYMENT_STATUS)
              .slice(1, 3)
              .map((month) => ({ label: month, value: month }))}
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
