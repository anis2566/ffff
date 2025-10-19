"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import {
  TeacherAdvanceSchema,
  TeacherAdvanceSchemaType,
} from "@workspace/utils/schemas";
import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormSearchSelect } from "@workspace/ui/shared/form-search-select";
import { useGetAdvances } from "../../filters/use-get-advances";

export const NewAdvanceForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchTeacherId, setSearchTeacherId] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetAdvances();

  const { data, isLoading: isLoadingTeachers } = useQuery(
    trpc.teacher.forSelect.queryOptions({
      name: searchTeacher,
      id: searchTeacherId,
    })
  );

  const handleTeacherChange = (teacherId: string | number) => {
    const teacher = data?.teachers.find((t) => t.id === teacherId);
    setSelectedTeacher(teacher?.name || "");
    form.setValue("teacherId", teacher?.id || "");
  };

  const { mutate: createAdcance, isPending } = useMutation(
    trpc.teacherAdvance.createOne.mutationOptions({
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
        queryClient.invalidateQueries(
          trpc.teacherAdvance.getMany.queryOptions({ ...filters })
        );
        router.push("/expense/advance");
      },
    })
  );

  const form = useForm<TeacherAdvanceSchemaType>({
    resolver: zodResolver(TeacherAdvanceSchema),
    defaultValues: {
      teacherId: "",
      amount: "",
    },
  });

  const onSubmit = (data: TeacherAdvanceSchemaType) => {
    setButtonState("loading");
    createAdcance(data);
  };

  return (
    <FormCardWrapper
      title="Set Up Advance"
      description="Enter the advance information to get started quickly."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormSearchSelect
            control={form.control}
            name="teacherId"
            label="Teacher"
            items={data?.teachers || []}
            isLoading={isLoadingTeachers}
            nameSearchValue={searchTeacher}
            onNameSearchChange={setSearchTeacher}
            idSearchValue={searchTeacherId}
            onIdSearchChange={setSearchTeacherId}
            selectedItemName={selectedTeacher}
            onSelectionChange={handleTeacherChange}
            isPending={isPending}
            config={{
              nameSearchPlaceholder: "Search by teacher name...",
              idSearchPlaceholder: "Search by teacher id...",
              selectPlaceholder: "Select teacher",
              minWidth: "400px",
              maxNameWidth: "150px",
            }}
          />

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
            loadingText="Saving..."
            successText="Saved!"
            errorText={errorText || "Failed"}
            state={buttonState}
            onStateChange={setButtonState}
            className="w-full md:w-auto rounded-full"
            icon={Send}
          >
            Save
          </LoadingButton>
        </form>
      </Form>
    </FormCardWrapper>
  );
};
