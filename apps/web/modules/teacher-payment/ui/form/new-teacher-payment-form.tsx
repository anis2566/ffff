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
  TeacherPaymentSchema,
  TeacherPaymentSchemaType,
} from "@workspace/utils/schemas";
import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormTextarea } from "@workspace/ui/shared/form-textarea";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Form } from "@workspace/ui/components/form";
import { FormSearchSelect } from "@workspace/ui/shared/form-search-select";
import { FormSelect } from "@workspace/ui/shared/form-select";
import { MONTH } from "@workspace/utils/constant";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { useGetPayments } from "../../filters/use-get-payments";
import { Separator } from "@workspace/ui/components/separator";

export const NewTeacherPaymentForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [searchTeacherId, setSearchTeacherId] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [classRate, setClassRate] = useState<number | null>(null);

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [filters] = useGetPayments();

  const { data, isLoading: isLoadingTeachers } = useQuery(
    trpc.teacher.forSelect.queryOptions({
      name: searchTeacher,
      id: searchTeacherId,
    })
  );

  const handleTeacherChange = (teacherId: string | number) => {
    const teacher = data?.teachers.find((t) => t.id === teacherId);
    setSelectedTeacher(teacher?.name || "");
    setClassRate(teacher?.classRate || null);
    form.setValue("teacherId", teacher?.id || "");
  };

  const { mutate: createPayment, isPending } = useMutation(
    trpc.teacherPayment.createOne.mutationOptions({
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
          trpc.teacherPayment.getMany.queryOptions({ ...filters })
        );
        router.push("/expense/teacher");
      },
    })
  );

  const form = useForm<TeacherPaymentSchemaType>({
    resolver: zodResolver(TeacherPaymentSchema),
    defaultValues: {
      teacherId: "",
      month: "",
      classUnit: "",
      incentive: "",
      deductionUnit: "",
      note: "",
    },
  });

  const onSubmit = (data: TeacherPaymentSchemaType) => {
    setButtonState("loading");
    createPayment(data);
  };

  const totalClass = parseInt(form.watch("classUnit")) || 0;
  const totalDeduction = parseInt(form.watch("deductionUnit") || "0");
  const totalClassAmount = parseInt(form.watch("classUnit")) * (classRate || 0);
  const totalIncentiveAmount = parseInt(form.watch("incentive") || "0");
  const totalDeductionAmount =
    parseInt(form.watch("deductionUnit") || "0") * (classRate || 0);

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormCardWrapper
        title="Set Up Teacher Payment"
        description="Enter the advance information to get started quickly."
        className="md:col-span-2"
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
            <FormSelect
              form={form}
              name="month"
              label="Month"
              placeholder="select month"
              options={Object.values(MONTH).map((className) => ({
                label: className,
                value: className,
              }))}
              disabled={isPending}
            />

            <FormInput
              form={form}
              name="classUnit"
              label="Total Class"
              type="number"
              disabled={isPending}
            />

            <FormInput
              form={form}
              name="deductionUnit"
              label="Deduction"
              type="number"
              disabled={isPending}
            />

            <FormInput
              form={form}
              name="incentive"
              label="Incentive"
              type="number"
              disabled={isPending}
            />

            <FormTextarea
              form={form}
              name="note"
              label="Note"
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

      <ListCardWrapper
        title={
          selectedTeacher
            ? `Teacher Payment for ${selectedTeacher}`
            : "No Teacher Selected"
        }
        className="h-fit max-h-fit"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Total Class
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {totalClass} * {classRate} = {totalClassAmount}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Incentive
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {totalIncentiveAmount}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Deduction
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {totalDeduction} * {classRate} = {totalDeductionAmount}
            </span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Net
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {totalClassAmount - totalDeductionAmount + totalIncentiveAmount}
            </span>
          </div>
        </div>
      </ListCardWrapper>
    </div>
  );
};
