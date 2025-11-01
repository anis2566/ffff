"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { FormSelect } from "@workspace/ui/shared/form-select";

export const PushToDocumentModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, name, subjectId, classNameId } = usePushToDocument();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

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

  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: DOCUMENT_TYPE.Question,
        name: name ?? "",
        classNameId: classNameId ?? "",
        subjectId: subjectId ?? "",
        deliveryDate: "",
        noOfCopy: "",
      });
    }
  }, [isOpen, form, name, subjectId, classNameId]);

  const { data: users } = useQuery(
    trpc.user.forSelect.queryOptions({ search: "" })
  );

  const userOptions =
    users?.map((user) => ({
      value: user.id,
      label: user.name ?? "",
    })) ?? [];

  const { mutate: pushToDocument, isPending } = useMutation(
    trpc.document.createOne.mutationOptions({
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
          queryKey: trpc.document.getMany.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: DocumentSchemaType) => {
    pushToDocument(data);
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
              <FormSelect
                form={form}
                name="userId"
                label="User"
                placeholder="Select user"
                options={userOptions}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
