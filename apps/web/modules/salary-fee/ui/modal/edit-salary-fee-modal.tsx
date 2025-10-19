"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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

import { SalaryFeeSchema, SalaryFeeSchemaType } from "@workspace/utils/schemas";
import { ADMISSION_TYPE, GROUPS } from "@workspace/utils/constant";

import { useGetSalaryFees } from "../../filters/use-get-salary-fees";
import { useEditSalaryFee } from "@/hooks/use-salary-fee";

export const EditSalaryFeeModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose, feeId, classNameId, amount, group, type } =
    useEditSalaryFee();
  const trpc = useTRPC();
  const [filters] = useGetSalaryFees();
  const queryClient = useQueryClient();

  useEffect(() => {
    form.setValue("classNameId", classNameId);
    form.setValue("amount", amount);
    form.setValue("group", group);
    form.setValue("type", type);
  }, [classNameId, amount, group, type]);

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: updateSalaryFee, isPending } = useMutation(
    trpc.salaryFee.updateOne.mutationOptions({
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
          trpc.salaryFee.getMany.queryOptions({ ...filters })
        );
        onClose();
      },
    })
  );

  const form = useForm<SalaryFeeSchemaType>({
    resolver: zodResolver(SalaryFeeSchema),
    defaultValues: {
      classNameId: "",
      amount: "",
      group: "",
      type: "",
    },
  });

  const onSubmit = (data: SalaryFeeSchemaType) => {
    setButtonState("loading");
    updateSalaryFee({
      ...data,
      id: feeId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Salary Fee</DialogTitle>
          <DialogDescription>
            Make changes to your salary fee details. Do not forget to save when
            you are done.
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
              options={Object.values(ADMISSION_TYPE).map((type) => ({
                label: type,
                value: type,
              }))}
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
            <FormSelect
              form={form}
              name="group"
              label="Group"
              placeholder="Select group"
              disabled={isPending}
              options={Object.values(GROUPS).map((group) => ({
                label: group,
                value: group,
              }))}
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
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Updating..."
              successText="Updated!"
              errorText={errorText || "Failed"}
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
