"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import { HomeworkSchema, HomeworkSchemaType } from "@workspace/utils/schemas";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { FormCalendar } from "@workspace/ui/shared/form-calendar";

export const NewHomeworkForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createHomework, isPending } = useMutation(
    trpc.homework.createOne.mutationOptions({
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
          queryKey: trpc.homework.getMany.queryKey(),
        });
        router.push("/homework");
      },
    })
  );

  const form = useForm<HomeworkSchemaType>({
    resolver: zodResolver(HomeworkSchema),
    defaultValues: {
      date: "",
      subjectId: "",
      batchId: "",
      classNameId: "",
    },
  });

  const classNameId = form.watch("classNameId");

  const [{ data: classes }, { data: batches }, { data: subjects }] = useQueries(
    {
      queries: [
        trpc.class.forSelect.queryOptions({ search: "" }),
        trpc.batch.getByClass.queryOptions(classNameId),
        trpc.subject.getByClass.queryOptions(classNameId),
      ],
    }
  );

  const onSubmit = (data: HomeworkSchemaType) => {
    createHomework(data);
  };

  return (
    <FormCardWrapper
      title="Set Up Your Homework"
      description="Enter the room information to get started quickly."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            form={form}
            name="classNameId"
            label="Class"
            placeholder="Select class"
            options={
              classes?.map((classItem) => ({
                label: classItem.name,
                value: classItem.id,
              })) || []
            }
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="batchId"
            label="Batch"
            placeholder="Select batch"
            options={
              batches?.map((batch) => ({
                label: batch.name,
                value: batch.id,
              })) || []
            }
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="subjectId"
            label="Subject"
            placeholder="Select subject"
            options={
              subjects?.map((subject) => ({
                label: subject.name,
                value: subject.id,
              })) || []
            }
            disabled={isPending}
          />
          <FormCalendar
            form={form}
            name="date"
            label="Date"
            placeholder="Select date"
            disabled={isPending}
            disablePast
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
    </FormCardWrapper>
  );
};
