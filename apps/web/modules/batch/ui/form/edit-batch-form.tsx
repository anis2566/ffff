"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import { BatchSchema, BatchSchemaType } from "@workspace/utils/schemas";
import { LEVELS } from "@workspace/utils/constant";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";

import { useGetBatches } from "../../filters/use-get-batches";

interface Props {
  id: string;
}

export const EditBatchForm = ({ id }: Props) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters] = useGetBatches();

  const { data: batchData } = useSuspenseQuery(
    trpc.batch.getOne.queryOptions(id)
  );

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: updateBatch, isPending } = useMutation(
    trpc.batch.updateOne.mutationOptions({
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
            trpc.batch.getMany.queryOptions({ ...filters })
          ),
          queryClient.invalidateQueries(trpc.batch.getOne.queryOptions(id)),
        ]);
        router.push("/batch");
      },
    })
  );

  const form = useForm<BatchSchemaType>({
    resolver: zodResolver(BatchSchema),
    defaultValues: {
      name: batchData?.name || "",
      classNameId: batchData?.classNameId || "",
      capacity: batchData?.capacity?.toString() || "",
      level: batchData?.level || "",
      roomId: batchData?.roomId || "",
      time: batchData?.time || [],
      classTime: batchData?.classTime || [],
    },
  });

  const onSubmit = (data: BatchSchemaType) => {
    console.log(data);
    setButtonState("loading");
    updateBatch({
      id,
      ...data,
    });
  };

  return (
    <FormCardWrapper
      title="Set Up Your Batch"
      description="Enter the batch information to get started quickly."
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
          <FormSelect
            form={form}
            name="className"
            label="Class"
            placeholder="Select class"
            options={(classes || []).map((classItem) => ({
              label: classItem.name,
              value: classItem.id,
            }))}
            disabled={isPending}
          />
          <FormInput
            form={form}
            name="capacity"
            label="Capacity"
            type="number"
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="level"
            label="Level"
            placeholder="Select level"
            options={Object.values(LEVELS).map((house) => ({
              label: house,
              value: house,
            }))}
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
            icon={Send}
          >
            Update
          </LoadingButton>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
