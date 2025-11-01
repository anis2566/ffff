"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMutation,
  useQueries,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
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

interface EditExamFromProps {
  id: string;
}

export const EditExamForm = ({ id }: EditExamFromProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [enableCq, setEnableCq] = useState<boolean>(false);
  const [enableMcq, setEnableMcq] = useState<boolean>(false);
  const [enableWritten, setEnableWritten] = useState<boolean>(false);

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const { data: exam } = useSuspenseQuery(trpc.exam.getOne.queryOptions(id));

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

  const classOptions =
    classes?.map((classItem) => ({
      value: classItem.id,
      label: classItem.name,
    })) || [];

  const batchOptions =
    batches?.map((batchItem) => ({
      value: batchItem.id,
      label: batchItem.name,
    })) || [];

  const subjectOptions =
    subjects?.map((subjectItem) => ({
      value: subjectItem.id,
      label: subjectItem.name,
    })) || [];

  const categoryOptions =
    categories?.map((categoryItem) => ({
      value: categoryItem.id,
      label: categoryItem.name,
    })) || [];

  // Changed from createOne to updateOne
  const { mutate: updateExam, isPending } = useMutation(
    trpc.exam.updateOne.mutationOptions({
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
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.exam.getOne.queryKey(id),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.exam.getMany.queryKey(),
          }),
        ]);
        router.push("/exam");
      },
    })
  );

  useEffect(() => {
    if (exam) {
      form.reset({
        name: exam.name || "",
        topic: exam.topic || "",
        subjectId: exam.subjectId || "",
        batchId: exam.batchId || "",
        classNameId: exam.classNameId || "",
        examCategoryId: exam.examCategoryId || "",
        date: exam.date.toISOString() || "",
        cq: exam.cq?.toString() || "",
        mcq: exam.mcq?.toString() || "",
        written: exam.written?.toString() || "",
      });

      // Set checkbox states based on existing data
      setEnableCq(!!exam.cq);
      setEnableMcq(!!exam.mcq);
      setEnableWritten(!!exam.written);
    }
  }, [exam, form, classes, batches, subjects, categories]);

  const onSubmit = (data: ExamSchemaType) => {
    updateExam({ id, data });
  };

  return (
    <FormCardWrapper
      title="Edit Exam"
      description="Update the exam information below."
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
            options={classOptions}
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="batchId"
            label="Batch"
            placeholder="Select batch"
            options={batchOptions}
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="subjectId"
            label="Subject"
            placeholder="Select subject"
            options={subjectOptions}
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="examCategoryId"
            label="Category"
            placeholder="Select category"
            options={categoryOptions}
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
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full rounded-full"
            icon={Send}
          >
            Update
          </LoadingButton>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
