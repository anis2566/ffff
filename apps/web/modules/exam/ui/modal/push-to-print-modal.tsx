"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { FormInput } from "@workspace/ui/shared/form-input";
import { Form } from "@workspace/ui/components/form";
import { usePushToPrintTask } from "@/hooks/use-document";
import z from "zod";

const formSchema = z.object({
  documentId: z.string(),
  noOfCopy: z.string(),
  path: z.string().optional(),
});

export const PushToPrintModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose, documentId, noOfCopy } = usePushToPrintTask();

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: pushToPrintTask, isPending } = useMutation(
    trpc.document.pushToPrint.mutationOptions({
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
        queryClient.invalidateQueries({
          queryKey: trpc.printTask.getMany.queryKey(),
        });
        onClose();
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentId: documentId,
      noOfCopy: noOfCopy,
      path: "",
    },
  });

  useEffect(() => {
    form.setValue("noOfCopy", noOfCopy);
    form.setValue("documentId", documentId);
  }, [documentId, form, noOfCopy]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setButtonState("loading");
    pushToPrintTask(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Push to Print</DialogTitle>
          <DialogDescription>Push this document to print</DialogDescription>
        </DialogHeader>

        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormInput
                form={form}
                name="noOfCopy"
                label="Number of Copy"
                disabled={isPending}
                type="number"
              />
              <FormInput
                form={form}
                name="path"
                label="Path"
                disabled={isPending}
                type="text"
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
