"use client";

import { useTRPC } from "@/trpc/react";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormInput } from "@workspace/ui/shared/form-input";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import {
  TeacherAdvanceSchema,
  TeacherAdvanceSchemaType,
} from "@workspace/utils/schemas";
import { useGetAdvances } from "../../filters/use-get-advances";

interface EditTeacherAdvanceFormViewProps {
  id: string;
}

export const EditAdvanceForm = ({ id }: EditTeacherAdvanceFormViewProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetAdvances();

  const { data } = useSuspenseQuery(
    trpc.teacherAdvance.getOne.queryOptions(id)
  );

  const { mutate: updateAdvance, isPending } = useMutation(
    trpc.teacherAdvance.updateOne.mutationOptions({
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
        await Promise.all([
          queryClient.invalidateQueries(
            trpc.teacherAdvance.getMany.queryOptions({ ...filters })
          ),
          queryClient.invalidateQueries(
            trpc.teacherAdvance.getOne.queryOptions(id)
          ),
        ]);
        router.push("/expense/advance");
      },
    })
  );

  const form = useForm<TeacherAdvanceSchemaType>({
    resolver: zodResolver(TeacherAdvanceSchema),
    defaultValues: {
      teacherId: data?.teacherId || "",
      amount: data?.amount?.toString() || "",
    },
  });

  const onSubmit = (data: TeacherAdvanceSchemaType) => {
    setButtonState("loading");
    updateAdvance({
      ...data,
      id,
    });
  };

  return (
    <FormCardWrapper
      title="Update Advance"
      description="Modify the class details and save your changes."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            form={form}
            name="amount"
            label="Amount"
            type="number"
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
