"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import { RoomSchema, RoomSchemaType } from "@workspace/utils/schemas";

import { FormSelect } from "@workspace/ui/shared/form-select";
import { FormMultiSelect } from "@workspace/ui/shared/form-multi-select";
import { timeSlots } from "@workspace/utils/constant";
import { useCreateRoom } from "@/hooks/use-room";

const DEFAULT_VALUES: RoomSchemaType = {
  houseId: "",
  name: "",
  capacity: "",
  availableTimes: [],
};

export const CreateRoomModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose } = useCreateRoom();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<RoomSchemaType>({
    resolver: zodResolver(RoomSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { data: houses } = useQuery(
    trpc.house.forSelect.queryOptions({ query: "" })
  );

  const houseData = (houses || []).map((house) => ({
    value: house.id,
    label: house.name,
  }));

  const { mutate: createRoom, isPending } = useMutation(
    trpc.room.createOne.mutationOptions({
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
        form.reset(DEFAULT_VALUES);

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const handleSubmit = (data: RoomSchemaType) => {
    createRoom(data);
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
          <DialogTitle>Set up your room</DialogTitle>
          <DialogDescription>
            This information will be used to create your room.
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
              Submit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
