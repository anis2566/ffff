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
import { useGetPayments } from "../../filters/use-get-payments";
import { useGetDuePayments } from "../../filters/use-get-due-payments";
import { useGetOverview } from "../../filters/use-get-overview";

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
  const [errorText, setErrorText] = useState<string>("");
  const [isEditable, setIsEditable] = useState<boolean>(false);

  const trpc = useTRPC();
  const { onOpen } = useShowTransaction();
  const queryClient = useQueryClient();
  const [filters] = useGetPayments();
  const [dueFilters] = useGetDuePayments();
  const [overviewFilters] = useGetOverview();

  const onToggleEdit = () => {
    if (status !== SALARY_STATUS.Absent) return;

    setIsEditable(!isEditable);
  };

  const { mutate: updatePayment, isPending } = useMutation(
    trpc.salaryPayment.updateOne.mutationOptions({
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
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.salaryPayment.getMany.queryOptions({ ...filters })
          ),
          queryClient.invalidateQueries(
            trpc.salaryPayment.getDueMany.queryOptions({ ...dueFilters })
          ),
          queryClient.invalidateQueries(
            trpc.salaryPayment.getOverview.queryOptions({
              ...overviewFilters,
            })
          ),
        ]);
        onOpen(data.transactionId || "", data.amount || 0, data.status || "");
      },
    })
  );

  const form = useForm<SalaryPaymentSchemaType>({
    resolver: zodResolver(SalaryPaymentSchema),
    defaultValues: {
      method: PAYMENT_METHOD.Cash,
      amount: amount.toString(),
      note: "",
    },
  });

  const onSubmit = (value: SalaryPaymentSchemaType) => {
    setButtonState("loading");
    if (
      status === SALARY_STATUS.Absent &&
      amount !== parseInt(value.amount) &&
      !value.note
    ) {
      if (parseInt(value.amount) > amount) {
        setButtonState("error");
        setErrorText("Invalid amount.");
        toast.error("Invalid amount.");
        return;
      }
      setButtonState("error");
      setErrorText("Please add note.");
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
                      disabled={
                        status !== SALARY_STATUS.Absent ||
                        !isEditable ||
                        isPending
                      }
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
                      disabled={isPending || status !== SALARY_STATUS.Absent}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Collapsible open={isEditable && status === SALARY_STATUS.Absent}>
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
            onClick={form.handleSubmit(onSubmit)}
            loadingText="Confirming..."
            successText="Confirmed!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto rounded-full"
            icon={Send}
          >
            Confirm
          </LoadingButton>
        </form>
      </Form>
    </CardWrapper>
  );
};
