"use client";

import { useTRPC } from "@/trpc/react";
import {
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormInput } from "@workspace/ui/shared/form-input";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { RoomSchema, RoomSchemaType } from "@workspace/utils/schemas";
import { FormMultiSelect } from "@workspace/ui/shared/form-multi-select";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { timeSlots } from "@workspace/utils/constant";

import { useGetRooms } from "../../filters/use-get-rooms";

interface EditRoomFormViewProps {
  id: string;
}

export const EditRoomForm = ({ id }: EditRoomFormViewProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetRooms();

  const { data } = useSuspenseQuery(trpc.room.getOne.queryOptions(id));
  const { data: houses } = useQuery(
    trpc.house.forSelect.queryOptions({ query: "" })
  );

  const { mutate: updateRoom, isPending } = useMutation(
    trpc.room.updateOne.mutationOptions({
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
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.room.getMany.queryOptions({ ...filters })
          ),
          queryClient.invalidateQueries(trpc.room.getOne.queryOptions(id)),
        ]);
        router.push("/room");
      },
    })
  );

  const form = useForm<RoomSchemaType>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      name: data.name,
      houseId: data.houseId,
      capacity: data.capacity.toString(),
      availableTimes: data.availableTimes,
    },
  });

  const onSubmit = (data: RoomSchemaType) => {
    setButtonState("loading");
    updateRoom({
      ...data,
      id,
    });
  };

  return (
    <FormCardWrapper
      title="Update room"
      description="Modify the room details and save your changes."
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
            loadingText="Updating..."
            successText="Updated!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto rounded-full"
            icon={Save}
          >
            Update
          </LoadingButton>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
