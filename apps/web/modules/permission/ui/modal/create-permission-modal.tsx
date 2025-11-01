"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import {
  PermissionSchema,
  PermissionSchemaType,
} from "@workspace/utils/schemas";

import { useCreatePermission } from "@/hooks/use-permission";
import { modules } from "@workspace/utils/constant";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { FormMultiSelect } from "@workspace/ui/shared/form-multi-select";

export const CreatePermissionModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [actions, setActions] = useState<string[]>([]);

  const { isOpen, onClose } = useCreatePermission();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { mutate: createPermission, isPending } = useMutation(
    trpc.permission.createOne.mutationOptions({
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
          queryKey: trpc.permission.getMany.queryKey(),
        });
        form.reset({
          module: "",
          actions: [],
        });
        onClose();
      },
    })
  );

  const form = useForm<PermissionSchemaType>({
    resolver: zodResolver(PermissionSchema),
    defaultValues: {
      module: "",
      actions: [],
    },
  });

  const onSubmit = (data: PermissionSchemaType) => {
    setButtonState("loading");
    createPermission(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Set up your permission<p></p>
          </DialogTitle>
          <DialogDescription>
            This information will be used to create your permission.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              form={form}
              name="module"
              label="Module"
              placeholder="Select module"
              options={modules.map((module) => ({
                value: module.name,
                label: module.name,
              }))}
              onClick={(module) => {
                setActions(
                  modules.find((m) => m.name === module)?.actions ?? []
                );
              }}
              disabled={isPending}
            />

            <FormMultiSelect
              form={form}
              name="actions"
              label="Actions"
              placeholder="Select actions"
              options={actions}
              disabled={isPending}
            />
            <LoadingButton
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Submitting..."
              successText="Submitted!"
              errorText={errorText || "Failed"}
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full rounded-full"
              icon={Send}
            >
              Submit
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
