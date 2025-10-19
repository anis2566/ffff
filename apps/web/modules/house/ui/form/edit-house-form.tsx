"use client";

import { useTRPC } from "@/trpc/react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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

import { HouseSchema, HouseSchemaType } from "@workspace/utils/schemas";
import { useGetHouses } from "../../filters/use-get-houses";

interface EditHouseFormViewProps {
  id: string;
}

export const EditHouseForm = ({ id }: EditHouseFormViewProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetHouses();

  const { data } = useSuspenseQuery(trpc.house.getOne.queryOptions(id));

  const { mutate: updateHouse, isPending } = useMutation(
    trpc.house.updateOne.mutationOptions({
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
            trpc.house.getMany.queryOptions({ ...filters })
          ),
          queryClient.invalidateQueries(trpc.house.getOne.queryOptions(id)),
        ]);
        router.push("/house");
      },
    })
  );

  const form = useForm<HouseSchemaType>({
    resolver: zodResolver(HouseSchema),
    defaultValues: {
      name: data.name,
      roomCount: data.roomCount.toString(),
    },
  });

  const onSubmit = (data: HouseSchemaType) => {
    setButtonState("loading");
    updateHouse({
      ...data,
      id,
    });
  };

  return (
    <FormCardWrapper
      title="Update House"
      description="Modify the house details and save your changes."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            form={form}
            name="name"
            label="Name"
            type="text"
            disabled={isPending}
          />
          <FormInput
            form={form}
            name="roomCount"
            label="No of Rooms"
            type="number"
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
