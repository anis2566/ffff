"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import { usePushToDocument } from "@/hooks/use-exam";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { DocumentSchema, DocumentSchemaType } from "@workspace/utils/schemas";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { FormInput } from "@workspace/ui/shared/form-input";
import { Form } from "@workspace/ui/components/form";
import { FormDateTimePicker } from "@workspace/ui/shared/form-date-time-picker";
import { DOCUMENT_TYPE } from "@workspace/utils/constant";

export const PushToDocumentModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose, name, subjectId, classNameId } = usePushToDocument();

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: createExam, isPending } = useMutation(
    trpc.document.createOne.mutationOptions({
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
          queryKey: trpc.document.getMany.queryKey(),
        });
        onClose();
        router.push("/exam/document");
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
    },
  });

  useEffect(() => {
    form.setValue("type", DOCUMENT_TYPE.Question);
    form.setValue("name", name);
    form.setValue("subjectId", subjectId);
    form.setValue("classNameId", classNameId);
  }, [name, subjectId, classNameId]);

  const onSubmit = (data: DocumentSchemaType) => {
    setButtonState("loading");
    createExam(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Push to document</DialogTitle>
          <DialogDescription>Push exam to document</DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                form={form}
                name="name"
                label="Name"
                disabled={isPending}
                type="text"
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
              <LoadingButton
                type="submit"
                onClick={form.handleSubmit(onSubmit)}
                loadingText="Saving..."
                successText="Saved!"
                errorText={errorText || "Failed"}
                state={buttonState}
                onStateChange={setButtonState}
                className="w-full rounded-full"
                icon={Send}
              >
                Save
              </LoadingButton>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
