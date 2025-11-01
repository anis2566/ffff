"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { HouseSchema, HouseSchemaType } from "@workspace/utils/schemas";
import { useEditHouse } from "@/hooks/use-house";

export const EditHouseModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, houseId, name, roomCount } = useEditHouse();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<HouseSchemaType>({
    resolver: zodResolver(HouseSchema),
    defaultValues: {
      name: "",
      roomCount: "",
    },
  });

  // Update form values when modal opens with class data
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name,
        roomCount: roomCount.toString(),
      });
    }
  }, [isOpen, form, name, roomCount]);

  const { mutate: updateHouse } = useMutation(
    trpc.house.updateOne.mutationOptions({
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

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleSubmit = (data: HouseSchemaType) => {
    updateHouse({
      ...data,
      id: houseId,
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
          <DialogTitle>Edit House</DialogTitle>
          <DialogDescription>
            Make changes to your class details. Click save when you are done.
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
              Update
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
