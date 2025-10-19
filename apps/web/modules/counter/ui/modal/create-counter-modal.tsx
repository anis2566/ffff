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

import { CounterSchema, CounterSchemaType } from "@workspace/utils/schemas";

import { useGetCounters } from "../../filters/use-get-counters";
import { useCreateCounter } from "@/hooks/use-counter";

export const CreateCounterModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose } = useCreateCounter();
  const trpc = useTRPC();
  const [filters] = useGetCounters();
  const queryClient = useQueryClient();

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: createCounter, isPending } = useMutation(
    trpc.counter.createOne.mutationOptions({
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
          trpc.counter.getMany.queryOptions({ ...filters })
        );
        form.reset({
          type: "",
          value: "",
        });
        onClose();
      },
    })
  );

  const form = useForm<CounterSchemaType>({
    resolver: zodResolver(CounterSchema),
    defaultValues: {
      type: "",
      value: "",
    },
  });

  const onSubmit = (data: CounterSchemaType) => {
    setButtonState("loading");
    createCounter(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up your counter</DialogTitle>
          <DialogDescription>
            This information will be used to create your counter.
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
              options={[
                ...(classes?.map((classItem) => ({
                  label: classItem.name,
                  value: classItem.name,
                })) ?? []),
                {
                  label: "Teacher",
                  value: "Teacher",
                },
              ]}
            />
            <FormInput
              form={form}
              name="value"
              label="Value"
              disabled={isPending}
              type="number"
            />
            <LoadingButton
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Submitting..."
              successText="Submitted!"
              errorText={errorText || "Failed"}
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
