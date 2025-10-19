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

import {
  AdmissionFeeSchema,
  AdmissionFeeSchemaType,
} from "@workspace/utils/schemas";

import { useGetAdmissionFees } from "../../filters/use-get-admission-fees";
import { useEditAdmissionFee } from "@/hooks/use-admission-fee";

export const EditAdmissionFeeModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose, feeId, classNameId, amount } = useEditAdmissionFee();
  const trpc = useTRPC();
  const [filters] = useGetAdmissionFees();
  const queryClient = useQueryClient();

  useEffect(() => {
    form.setValue("classNameId", classNameId);
    form.setValue("amount", amount);
  }, [classNameId, amount]);

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: updateAdmissionFee, isPending } = useMutation(
    trpc.admissionFee.updateOne.mutationOptions({
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
          trpc.admissionFee.getMany.queryOptions({ ...filters })
        );
        onClose();
      },
    })
  );

  const form = useForm<AdmissionFeeSchemaType>({
    resolver: zodResolver(AdmissionFeeSchema),
    defaultValues: {
      classNameId: "",
      amount: "",
    },
  });

  const onSubmit = (data: AdmissionFeeSchemaType) => {
    setButtonState("loading");
    updateAdmissionFee({
      ...data,
      id: feeId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Admission Fee</DialogTitle>
          <DialogDescription>
            Make changes to your admission fee details. Do not forget to save
            when you are done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
