"use client";

import { useTRPC } from "@/trpc/react";
import { Edit, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { PAYMENT_METHOD, SALARY_STATUS } from "@workspace/utils/constant";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible";
import { Textarea } from "@workspace/ui/components/textarea";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

import {
  SalaryPaymentSchema,
  SalaryPaymentSchemaType,
} from "@workspace/utils/schemas";
import { useShowTransaction } from "@/hooks/use-salary-payment";

interface SalaryPaymentFormProps {
  id: string;
  amount: number;
  status: string;
}

export const SalaryPaymentForm = ({
  id,
  amount,
  status,
}: SalaryPaymentFormProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [isEditable, setIsEditable] = useState<boolean>(false);

  const trpc = useTRPC();
  const { onOpen } = useShowTransaction();
  const queryClient = useQueryClient();

  const form = useForm<SalaryPaymentSchemaType>({
    resolver: zodResolver(SalaryPaymentSchema),
    defaultValues: {
      method: PAYMENT_METHOD.Cash,
      amount: amount.toString(),
      note: "",
    },
  });

  const onToggleEdit = () => {
    setIsEditable(!isEditable);
  };

  const { mutate: updatePayment, isPending } = useMutation(
    trpc.salaryPayment.updateOne.mutationOptions({
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
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.salaryPayment.getMany.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.salaryPayment.getOne.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.salaryPayment.getMany.queryKey(),
          }),
        ]);
        onOpen(data.transactionId || "", data.amount || 0, data.status || "");
      },
    })
  );

  const onSubmit = (value: SalaryPaymentSchemaType) => {
    if (
      amount !== parseInt(value.amount) &&
      !value.note
    ) {
      if (parseInt(value.amount) > amount) {
        setButtonState("error");
        toast.error("Invalid amount.");
        return;
      }
      setButtonState("error");
      toast.error("Please add note.");
      return;
    }
    updatePayment({
      ...value,
      id,
    });
  };

  return (
    <CardWrapper>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            form={form}
            name="method"
            label="Method"
            placeholder="Select method"
            options={Object.values(PAYMENT_METHOD).map((item) => ({
              label: item,
              value: item,
            }))}
            disabled={isPending}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      value={field.value}
                      type="number"
                      disabled={!isEditable || isPending}
                      className={cn(
                        "w-full bg-background dark:bg-background rounded-xs shadow-none",
                        !isEditable && "bg-background/40 dark:bg-background/40"
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0"
                      type="button"
                      onClick={onToggleEdit}
                      disabled={isPending}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Collapsible open={isEditable}>
            <CollapsibleContent>
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value}
                        disabled={isPending}
                        className="w-full bg-background dark:bg-background rounded-xs shadow-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>
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
    </CardWrapper>
  );
};
