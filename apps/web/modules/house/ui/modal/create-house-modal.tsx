"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import { FormInput } from "@workspace/ui/shared/form-input";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { HouseSchema, HouseSchemaType } from "@workspace/utils/schemas";

import { useCreateHouse } from "@/hooks/use-house";

const DEFAULT_VALUES: HouseSchemaType = {
  name: "",
  roomCount: "",
};

export const CreateHouseModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateHouse();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<HouseSchemaType>({
    resolver: zodResolver(HouseSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { mutate: createHouse } = useMutation(
    trpc.house.createOne.mutationOptions({
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
          queryKey: trpc.house.getMany.queryKey(),
        });
        form.reset(DEFAULT_VALUES);

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleSubmit = (data: HouseSchemaType) => {
    createHouse(data);
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
          <DialogTitle>Set up your house</DialogTitle>
          <DialogDescription>
            This information will be used to create your house.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormInput form={form} name="name" label="Name" />

            <FormInput
              form={form}
              name="roomCount"
              label="No of Rooms"
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
