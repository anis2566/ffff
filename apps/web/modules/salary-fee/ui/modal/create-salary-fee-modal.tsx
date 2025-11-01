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

import { SalaryFeeSchema, SalaryFeeSchemaType } from "@workspace/utils/schemas";
import { GROUPS, Session } from "@workspace/utils/constant";

import { useCreateSalaryFee } from "@/hooks/use-salary-fee";

const DEFAULT_VALUES: SalaryFeeSchemaType = {
  session: "",
  classNameId: "",
  amount: "",
  group: "",
};

const GROUP_OPTIONS = Object.values(GROUPS).map((group) => ({
  label: group,
  value: group,
}));

export const CreateSalaryFeeModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateSalaryFee();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<SalaryFeeSchemaType>({
    resolver: zodResolver(SalaryFeeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: createSalaryFee, isPending } = useMutation(
    trpc.salaryFee.createOne.mutationOptions({
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
          queryKey: trpc.salaryFee.getMany.queryKey(),
        });
        form.reset(DEFAULT_VALUES);

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: SalaryFeeSchemaType) => {
    createSalaryFee(data);
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
            This information will be used to create your salary fee.
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
            <FormSelect
              form={form}
              name="group"
              label="Group"
              placeholder="Select group"
              disabled={isPending}
              options={GROUP_OPTIONS}
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
