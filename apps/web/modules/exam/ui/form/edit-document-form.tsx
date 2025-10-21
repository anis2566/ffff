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
import { DocumentSchema, DocumentSchemaType } from "@workspace/utils/schemas";
import { DOCUMENT_TYPE } from "@workspace/utils/constant";
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormDateTimePicker } from "@workspace/ui/shared/form-date-time-picker";

interface EditDocumentFormProps {
  id: string;
}

export const EditDocumentForm = ({ id }: EditDocumentFormProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: document } = useSuspenseQuery(
    trpc.document.getOne.queryOptions(id)
  );

  const { mutate: updateExam, isPending } = useMutation(
    trpc.document.updateOne.mutationOptions({
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
        queryClient.invalidateQueries({
          queryKey: trpc.document.getOne.queryKey(id),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.document.getMany.queryKey(),
        });
        router.push("/document");
      },
    })
  );

  const form = useForm<DocumentSchemaType>({
    resolver: zodResolver(DocumentSchema),
    defaultValues: {
      type: "",
      name: "",
      classNameId: "",
      subjectId: "",
      deliveryDate: "",
      noOfCopy: "",
      userId: "",
    },
  });

  const classNameId = form.watch("classNameId");

  const [{ data: classes }, { data: subjects }, { data: users }] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.subject.getByClass.queryOptions(classNameId),
      trpc.user.forSelect.queryOptions({ search: "" }),
    ],
  });

  useEffect(() => {
    if (document) {
      form.reset({
        type: document.type,
        name: document.name,
        classNameId: document.classNameId,
        subjectId: document.subjectId,
        deliveryDate: document.deliveryDate.toISOString(),
        noOfCopy: document.noOfCopy.toString(),
        userId: document.userId,
      });
    }
  }, [document, form, classes, subjects, users]);

  const onSubmit = (data: DocumentSchemaType) => {
    setButtonState("loading");
    updateExam({
      ...data,
      documentId: id,
    });
  };

  return (
    <FormCardWrapper
      title="Edit Exam"
      description="Update the exam information below."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            form={form}
            name="type"
            label="Type"
            placeholder="Select type"
            options={Object.values(DOCUMENT_TYPE).map((type) => ({
              value: type,
              label: type,
            }))}
            disabled={isPending}
          />
          <FormInput
            form={form}
            name="name"
            label="Name"
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
          <FormDateTimePicker
            form={form}
            name="deliveryDate"
            label="Delivery Date"
            showTime
            timeFormat="12h"
          />
          <FormInput
            form={form}
            name="noOfCopy"
            label="Number of Copy"
            disabled={isPending}
            type="number"
          />
          <FormSelect
            form={form}
            name="userId"
            label="User"
            placeholder="Select user"
            options={(users ?? []).map((user) => ({
              label: user.name || "",
              value: user.id,
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
