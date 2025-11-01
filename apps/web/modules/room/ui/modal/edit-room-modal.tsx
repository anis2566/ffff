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
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { RoomSchema, RoomSchemaType } from "@workspace/utils/schemas";
import { useEditRoom } from "@/hooks/use-room";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { FormMultiSelect } from "@workspace/ui/shared/form-multi-select";
import { timeSlots } from "@workspace/utils/constant";

export const EditRoomModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, roomId, houseId, name, capacity, availableTimes } =
    useEditRoom();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<RoomSchemaType>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      houseId,
      name,
      capacity: capacity.toString(),
      availableTimes,
    },
  });

  const { data: houses } = useQuery(
    trpc.house.forSelect.queryOptions({ query: "" })
  );

  const houseData = (houses || []).map((house) => ({
    value: house.id,
    label: house.name,
  }));

  // Update form values when modal opens with class data
  useEffect(() => {
    if (isOpen) {
      form.reset({
        houseId,
        name,
        capacity: capacity.toString(),
        availableTimes,
      });
    }
  }, [isOpen, form, houseId, name, capacity, availableTimes]);

  const { mutate: updateHouse, isPending } = useMutation(
    trpc.room.updateOne.mutationOptions({
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
          queryKey: trpc.room.getMany.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleSubmit = (data: RoomSchemaType) => {
    updateHouse({
      ...data,
      id: roomId,
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
            <FormSelect
              form={form}
              name="houseId"
              label="House"
              placeholder="Select House"
              options={houseData}
              disabled={isPending}
            />
            <FormInput
              form={form}
              name="name"
              label="Name"
              type="text"
              disabled={isPending}
            />
            <FormInput
              form={form}
              name="capacity"
              label="Capacity"
              type="number"
              disabled={isPending}
            />
            <FormMultiSelect
              form={form}
              name="availableTimes"
              label="Available Times"
              placeholder="Select times"
              options={timeSlots}
              disabled={isPending}
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
