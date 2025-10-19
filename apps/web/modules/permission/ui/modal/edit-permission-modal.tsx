"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send } from "lucide-react";
import z from "zod";

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

import { useEditPermission } from "@/hooks/use-permission";
import { FormMultiSelect } from "@workspace/ui/shared/form-multi-select";

const formSchema = z.object({
  roles: z.array(z.string()),
});

export const EditPermissionModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const { isOpen, onClose, permissionId, module, action, roles } =
    useEditPermission();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  useEffect(() => {
    form.setValue("roles", roles);
  }, [roles]);

  const { data } = useQuery(trpc.role.forSelect.queryOptions({ search: "" }));

  const { mutate: updatePermission, isPending } = useMutation(
    trpc.permission.updateOne.mutationOptions({
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
        onClose();
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roles: [],
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setButtonState("loading");
    updatePermission({
      permissionId,
      roles: data.roles,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={isPending ? () => {} : onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{module}</DialogTitle>
          <DialogDescription>
            Update the {action} action roles.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormMultiSelect
              form={form}
              name="roles"
              label="Roles"
              placeholder="Select roles"
              options={data?.map((role) => role.name) || []}
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
