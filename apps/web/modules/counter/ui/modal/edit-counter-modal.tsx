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

import { CounterSchema, CounterSchemaType } from "@workspace/utils/schemas";

import { useEditCounter } from "@/hooks/use-counter";
import { Session } from "@workspace/utils/constant";

export const EditCounterModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, counterId, session, type, value } = useEditCounter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<CounterSchemaType>({
    resolver: zodResolver(CounterSchema),
    defaultValues: {
      session: "",
      type: "",
      value: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        session,
        type,
        value,
      });
    }
  }, [isOpen, form, session, type, value]);

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: updateCounter, isPending } = useMutation(
    trpc.counter.updateOne.mutationOptions({
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
          queryKey: trpc.counter.getMany.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: CounterSchemaType) => {
    updateCounter({
      ...data,
      id: counterId,
    });
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
          <DialogTitle>Edit Counter</DialogTitle>
          <DialogDescription>
            Make changes to your counter details. Do not forget to save when you
            are done.
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
