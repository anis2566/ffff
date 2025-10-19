"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { FormCalendar } from "@workspace/ui/shared/form-calendar";
import { ExamSchema, ExamSchemaType } from "@workspace/utils/schemas";
import { FormInput } from "@workspace/ui/shared/form-input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible";
import { useGetExams } from "../../filters/use-get-exams";

export const NewExamForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [enableCq, setEnableCq] = useState<boolean>(false);
  const [enableMcq, setEnableMcq] = useState<boolean>(false);
  const [enableWritten, setEnableWritten] = useState<boolean>(false);

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters] = useGetExams()

  const { mutate: createExam, isPending } = useMutation(
    trpc.exam.createOne.mutationOptions({
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
          trpc.exam.getMany.queryOptions({ ...filters })
        );
        router.push("/exam");
      },
    })
  );

  const form = useForm<ExamSchemaType>({
    resolver: zodResolver(ExamSchema),
    defaultValues: {
      name: "",
      topic: "",
      subjectId: "",
      batchId: "",
      classNameId: "",
      examCategoryId: "",
      date: "",
      cq: "",
      mcq: "",
      written: "",
    },
  });

  const classNameId = form.watch("classNameId");

  const [
    { data: classes },
    { data: batches },
    { data: subjects },
    { data: categories },
  ] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.batch.getByClass.queryOptions(classNameId),
      trpc.subject.getByClass.queryOptions(classNameId),
      trpc.examCategory.forSelect.queryOptions({ search: "" }),
    ],
  });

  const onSubmit = (data: ExamSchemaType) => {
    setButtonState("loading");
    createExam(data);
  };

  return (
    <FormCardWrapper
      title="Set Up Your Exam"
      description="Enter the exam information to get started quickly."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            form={form}
            name="name"
            label="Name"
            disabled={isPending}
            type="text"
          />
          <FormInput
            form={form}
            name="topic"
            label="Topic"
            disabled={isPending}
            type="text"
          />
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
          <FormSelect
            form={form}
            name="examCategoryId"
            label="Category"
            placeholder="Select category"
            options={
              categories?.map((category) => ({
                label: category.name,
                value: category.id,
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
          <Label>Marks Allocation</Label>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <Checkbox
                id="cq"
                checked={enableCq}
                onCheckedChange={(checked) => {
                  setEnableCq(checked === true);
                }}
              />
              <Label htmlFor="cq">CQ</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="mcq"
                checked={enableMcq}
                onCheckedChange={(checked) => {
                  setEnableMcq(checked === true);
                }}
              />
              <Label htmlFor="mcq">MCQ</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="written"
                checked={enableWritten}
                onCheckedChange={(checked) => {
                  setEnableWritten(checked === true);
                }}
              />
              <Label htmlFor="written">Written</Label>
            </div>
          </div>
          <Collapsible open={enableCq}>
            <CollapsibleContent>
              <FormInput
                form={form}
                name="cq"
                label="CQ"
                disabled={isPending}
                type="number"
              />
            </CollapsibleContent>
          </Collapsible>
          <Collapsible open={enableMcq}>
            <CollapsibleContent>
              <FormInput
                form={form}
                name="mcq"
                label="MCQ"
                disabled={isPending}
                type="number"
              />
            </CollapsibleContent>
          </Collapsible>
          <Collapsible open={enableWritten}>
            <CollapsibleContent>
              <FormInput
                form={form}
                name="written"
                label="Written"
                disabled={isPending}
                type="number"
              />
            </CollapsibleContent>
          </Collapsible>
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
