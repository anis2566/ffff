"use client";

import { Search, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/react";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { FormInput } from "@workspace/ui/shared/form-input";
import { Button } from "@workspace/ui/components/button";

import {
  FindStudentSchema,
  FindStudentSchemaType,
} from "@workspace/utils/schemas";
import { cn } from "@workspace/ui/lib/utils";
import { Student } from "../view/new-salary-view";

interface FormProps {
  setStudent: Dispatch<SetStateAction<Student>>;
  student: Student | null;
}

export const NewSalaryForm = ({ setStudent, student }: FormProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");

  const trpc = useTRPC();

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const { mutate: findStudent, isPending } = useMutation(
    trpc.student.forPaymentSelect.mutationOptions({
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
        if (data.student) {
          setStudent(data.student);
        }
        setButtonState("success");
        toast.success(data.message);
      },
    })
  );

  const form = useForm<FindStudentSchemaType>({
    resolver: zodResolver(FindStudentSchema),
    defaultValues: {
      classNameId: "",
      search: "",
    },
  });

  const onSubmit = (data: FindStudentSchemaType) => {
    setStudent(null);
    setButtonState("loading");
    findStudent(data);
  };

  const handleReset = () => {
    form.reset({
      classNameId: "",
      search: "",
    });
    setButtonState("idle");
    setStudent(null);
  };

  return (
    <FormCardWrapper
      title="Find Student"
      description="Enter student details to find out"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect
            form={form}
            name="classNameId"
            label="Class"
            placeholder="Select class"
            options={
              classes?.map((className) => ({
                label: className.name,
                value: className.id,
              })) || []
            }
            disabled={isPending}
          />
          <FormInput
            form={form}
            name="search"
            label="Search"
            type="text"
            placeholder="Enter id, name or phone number"
            disabled={isPending}
          />
          <div className="flex items-center gap-x-3">
            <Button
              variant="secondary"
              className={cn(
                "hidden text-rose-600 rounded-full",
                student && "flex"
              )}
              onClick={handleReset}
              type="button"
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
            </Button>
            <LoadingButton
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Finding..."
              successText="Found!"
              errorText={errorText || "Failed"}
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full md:w-auto rounded-full"
              icon={Search}
            >
              Find
            </LoadingButton>
          </div>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
