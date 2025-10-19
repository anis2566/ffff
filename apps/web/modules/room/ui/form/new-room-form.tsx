"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import { RoomSchema, RoomSchemaType } from "@workspace/utils/schemas";
import { timeSlots } from "@workspace/utils/constant";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { FormMultiSelect } from "@workspace/ui/shared/form-multi-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";

import { useGetRooms } from "../../filters/use-get-rooms";

export const NewRoomForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetRooms();

  const { data: houses } = useQuery(
    trpc.house.forSelect.queryOptions({ query: "" })
  );

  const { mutate: createRoom, isPending } = useMutation(
    trpc.room.createOne.mutationOptions({
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
          trpc.room.getMany.queryOptions({ ...filters })
        );
        router.push("/room");
      },
    })
  );

  const form = useForm<RoomSchemaType>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      houseId: "",
      name: "",
      capacity: "",
      availableTimes: [],
    },
  });

  const onSubmit = (data: RoomSchemaType) => {
    console.log(data);
    setButtonState("loading");
    createRoom(data);
  };

  return (
    <FormCardWrapper
      title="Set Up Your Room"
      description="Enter the room information to get started quickly."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            form={form}
            name="houseId"
            label="House"
            placeholder="Select House"
            options={
              houses?.map((house) => ({
                label: house.name,
                value: house.id,
              })) || []
            }
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
            onClick={form.handleSubmit(onSubmit)}
            loadingText="Saving..."
            successText="Saved!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto rounded-full"
            icon={Send}
          >
            Save
          </LoadingButton>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
