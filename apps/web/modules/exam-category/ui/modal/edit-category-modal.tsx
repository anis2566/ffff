"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@workspace/ui/components/dialog";
import { Form } from "@workspace/ui/components/form";
import { FormInput } from "@workspace/ui/shared/form-input";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { ExamCategory, ExamCategoryType } from "@workspace/utils/schemas";

import { useEditCategory } from "@/hooks/use-category";

export const EditCategoryModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, onClose, categoryId, name } = useEditCategory();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<ExamCategoryType>({
    resolver: zodResolver(ExamCategory),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        name,
      });
    }
  }, [isOpen, form, name]);

  const { mutate: updateCategory, isPending } = useMutation(
    trpc.examCategory.updateOne.mutationOptions({
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
          queryKey: trpc.examCategory.getMany.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (data: ExamCategoryType) => {
    updateCategory({
      ...data,
      categoryId,
    });
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
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Make changes to your category details. Do not forget to save when
            you are done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              form={form}
              name="name"
              label="Name"
              disabled={isPending}
              type="text"
            />
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
      </DialogContent>
    </Dialog>
  );
};
