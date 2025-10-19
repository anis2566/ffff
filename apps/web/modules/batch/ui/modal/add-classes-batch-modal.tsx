"use client";

import { Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { FormSelect } from "@workspace/ui/shared/form-select";
import { FormMultiSelect } from "@workspace/ui/shared/form-multi-select";
import { DAYS } from "@workspace/utils/constant";
import { FormSearchSelect } from "@workspace/ui/shared/form-search-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

import { useCreateBatchClasses } from "@/hooks/use-batch";

// Constants moved outside component to prevent recreation
const DEFAULT_FORM_VALUES = {
  time: "",
  days: [],
  subjectId: "",
  teacherId: "",
};

const DAYS_OPTIONS = Object.values(DAYS).slice(0, 6);

const SUBJECT_CONFIG = {
  nameSearchPlaceholder: "Search by subject name...",
  minWidth: "400px",
  maxNameWidth: "150px",
  showIdSearch: false,
  selectPlaceholder: "Select subject",
} as const;

const TEACHER_CONFIG = {
  nameSearchPlaceholder: "Search by name...",
  minWidth: "400px",
  maxNameWidth: "150px",
  showIdSearch: false,
  selectPlaceholder: "Select teacher",
} as const;

interface FormState {
  searchSubject: string;
  selectedSubject: string;
  searchTeacher: string;
  selectedTeacher: string;
  buttonState: ButtonState;
  errorText: string;
}

export const AddClassesBatchModal = () => {
  const [formState, setFormState] = useState<FormState>({
    searchSubject: "",
    selectedSubject: "",
    searchTeacher: "",
    selectedTeacher: "",
    buttonState: "idle",
    errorText: "",
  });

  const { isOpen, onClose, times, level, batchId } = useCreateBatchClasses();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Memoize default values to prevent unnecessary re-renders
  const defaultValues = useMemo(
    () => ({
      ...DEFAULT_FORM_VALUES,
      batchId,
    }),
    [batchId]
  );

  const form = useForm<BatchClassSchemaType>({
    resolver: zodResolver(BatchClassSchema),
    defaultValues,
  });

  // Watch form values with useMemo to prevent unnecessary re-renders
  const watchedDays = form.watch("days");
  const watchedTime = form.watch("time");

  // Memoize time options
  const timeOptions = useMemo(
    () => times?.map((time) => ({ label: time, value: time })) || [],
    [times]
  );

  // Queries with proper dependency arrays
  const { data: subjects } = useQuery(
    trpc.subject.getByLevel.queryOptions({
      level,
      query: formState.searchSubject,
    })
  );

  const { data: teachers } = useQuery(
    trpc.teacher.getByAvailablity.queryOptions({
      level,
      days: watchedDays,
      time: watchedTime,
      query: formState.searchTeacher,
    })
  );

  // Reset form utility function
  const resetForm = useCallback(() => {
    form.reset({
      ...DEFAULT_FORM_VALUES,
      batchId,
    });
    setFormState((prev) => ({
      ...prev,
      selectedSubject: "",
      selectedTeacher: "",
      searchSubject: "",
      searchTeacher: "",
    }));
  }, [form, batchId]);

  // Optimized mutation with proper error handling
  const { mutate: createBatchClass, isPending } = useMutation(
    trpc.batchClass.createMany.mutationOptions({
      onError: (err) => {
        setFormState((prev) => ({
          ...prev,
          errorText: err.message,
          buttonState: "error",
        }));
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          setFormState((prev) => ({
            ...prev,
            buttonState: "error",
            errorText: data.message,
          }));
          toast.error(data.message);
          return;
        }

        setFormState((prev) => ({
          ...prev,
          buttonState: "success",
        }));
        toast.success(data.message);

        // Invalidate queries
        await queryClient.invalidateQueries(
          trpc.batchClass.getByBatch.queryOptions(batchId!)
        );

        resetForm();
        onClose();
      },
    })
  );

  // Effect to update batchId in form when it changes
  useEffect(() => {
    if (batchId && form.getValues("batchId") !== batchId) {
      form.setValue("batchId", batchId);
    }
  }, [batchId, form]);

  // Optimized selection handlers with useCallback
  const handleSubjectChange = useCallback(
    (subjectId: string | number) => {
      const subject = subjects?.find((s) => s.id === subjectId);
      setFormState((prev) => ({
        ...prev,
        selectedSubject: subject?.name || "",
      }));
      form.setValue("subjectId", subject?.id || "");
    },
    [subjects, form]
  );

  const handleTeacherChange = useCallback(
    (teacherId: string | number) => {
      const teacher = teachers?.find((t) => t.id === teacherId);
      setFormState((prev) => ({
        ...prev,
        selectedTeacher: teacher?.name || "",
      }));
      form.setValue("teacherId", teacher?.id || "");
    },
    [teachers, form]
  );

  // Optimized search handlers
  const handleSubjectSearch = useCallback((value: string) => {
    setFormState((prev) => ({
      ...prev,
      searchSubject: value,
    }));
  }, []);

  const handleTeacherSearch = useCallback((value: string) => {
    setFormState((prev) => ({
      ...prev,
      searchTeacher: value,
    }));
  }, []);

  // Optimized submit handler
  const onSubmit = useCallback(
    (data: BatchClassSchemaType) => {
      setFormState((prev) => ({
        ...prev,
        buttonState: "loading",
      }));
      createBatchClass({
        ...data,
        batchId,
      });
    },
    [createBatchClass, batchId]
  );

  // Memoize button state handler
  const handleButtonStateChange = useCallback((state: ButtonState) => {
    setFormState((prev) => ({
      ...prev,
      buttonState: state,
    }));
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xs">
        <DialogHeader>
          <DialogTitle>Add Classes</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              form={form}
              name="time"
              label="Time"
              placeholder="Select Time"
              options={timeOptions}
              disabled={isPending}
            />

            <FormMultiSelect
              form={form}
              name="days"
              label="Days"
              placeholder="Select Days"
              options={DAYS_OPTIONS}
              disabled={isPending}
            />

            <FormSearchSelect
              control={form.control}
              name="subjectId"
              label="Subject"
              items={subjects || []}
              isLoading={isPending}
              nameSearchValue={formState.searchSubject}
              onNameSearchChange={handleSubjectSearch}
              selectedItemName={formState.selectedSubject}
              onSelectionChange={handleSubjectChange}
              isPending={isPending}
              config={SUBJECT_CONFIG}
            />

            <FormSearchSelect
              control={form.control}
              name="teacherId"
              label="Teacher"
              items={teachers || []}
              isLoading={isPending}
              nameSearchValue={formState.searchTeacher}
              onNameSearchChange={handleTeacherSearch}
              selectedItemName={formState.selectedTeacher}
              onSelectionChange={handleTeacherChange}
              isPending={isPending}
              config={TEACHER_CONFIG}
            />

            <LoadingButton
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              loadingText="Saving..."
              successText="Saved!"
              errorText={formState.errorText || "Failed"}
              state={formState.buttonState}
              onStateChange={handleButtonStateChange}
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
