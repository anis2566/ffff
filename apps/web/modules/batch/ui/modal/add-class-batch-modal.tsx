"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTRPC } from "@/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";

import {
  BatchClassSchema,
  BatchClassSchemaType,
} from "@workspace/utils/schemas";
import { Form } from "@workspace/ui/components/form";
import { FormSearchSelect } from "@workspace/ui/shared/form-search-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { useCreateBatchClass } from "@/hooks/use-batch";

export const AddClassBatchModal = () => {
  const [searchSubject, setSearchSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTeacher, setSearchTeacher] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  const { isOpen, onClose, time, day, level, batchId } = useCreateBatchClass();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: subjects } = useQuery(
    trpc.subject.getByLevel.queryOptions({ level, query: searchSubject })
  );

  useEffect(() => {
    if (!day || !time || !batchId) return;
    setSelectedTime(time);
    setSelectedDays([day]);
    form.setValue("batchId", batchId);
    form.setValue("time", time);
    form.setValue("days", [day]);
  }, [day, time, batchId]);

  const { mutate: createBatchClass, isPending } = useMutation(
    trpc.batchClass.createMany.mutationOptions({
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
          trpc.batchClass.getByBatch.queryOptions(batchId!)
        );
        setSelectedSubject("");
        setSelectedTeacher("");
        setSearchSubject("");
        setSearchTeacher("");
        form.reset({
          time: "",
          days: [],
          batchId,
          subjectId: "",
          teacherId: "",
        });
        onClose();
      },
    })
  );

  const { data: teachers } = useQuery({
    ...trpc.teacher.getByAvailablity.queryOptions({
      level,
      time: selectedTime,
      days: selectedDays,
      query: searchTeacher,
    }),
    enabled: !!selectedTime && selectedDays.length > 0,
  });

  console.log(selectedDays, selectedTime);

  const handleSubjectChange = (teacherId: string | number) => {
    const subject = subjects?.find((t) => t.id === teacherId);
    setSelectedSubject(subject?.name || "");
    form.setValue("subjectId", subject?.id || "");
  };

  const handleTeacherChange = (teacherId: string | number) => {
    const teacher = teachers?.find((t) => t.id === teacherId);
    setSelectedTeacher(teacher?.name || "");
    form.setValue("teacherId", teacher?.id || "");
  };

  const form = useForm<BatchClassSchemaType>({
    resolver: zodResolver(BatchClassSchema),
    defaultValues: {
      time: "",
      days: [],
      batchId,
      subjectId: "",
      teacherId: "",
    },
  });

  const onSubmit = (data: BatchClassSchemaType) => {
    setButtonState("loading");
    createBatchClass({
      ...data,
      batchId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xs">
        <DialogHeader>
          <DialogTitle>Add Class</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSearchSelect
              control={form.control}
              name="subjectId"
              label="Subject"
              items={subjects || []}
              isLoading={isPending}
              nameSearchValue={searchSubject}
              onNameSearchChange={setSearchSubject}
              selectedItemName={selectedSubject}
              onSelectionChange={handleSubjectChange}
              isPending={isPending}
              config={{
                nameSearchPlaceholder: "Search by subject name...",
                minWidth: "400px",
                maxNameWidth: "150px",
                showIdSearch: false,
                selectPlaceholder: "Select subject",
              }}
            />
            <FormSearchSelect
              control={form.control}
              name="teacherId"
              label="Teacher"
              items={teachers || []}
              isLoading={isPending}
              nameSearchValue={searchTeacher}
              onNameSearchChange={setSearchTeacher}
              selectedItemName={selectedTeacher}
              onSelectionChange={handleTeacherChange}
              isPending={isPending}
              config={{
                nameSearchPlaceholder: "Search by name...",
                minWidth: "400px",
                maxNameWidth: "150px",
                showIdSearch: false,
                selectPlaceholder: "Select teacher",
              }}
            />
            <LoadingButton
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Saving..."
              successText="Saved!"
              errorText={errorText || "Failed"}
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full"
              icon={Send}
            >
              Save
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
