"use client";

import { useTRPC } from "@/trpc/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Send } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import { Input } from "@workspace/ui/components/input";

import { TeacherDeactivationReasons } from "@workspace/utils/constant";
import { useDeactiveTeacher } from "@/hooks/use-teacher";

// Zod schema for form validation
const formSchema = z
  .object({
    reason: z.string().min(1, "Please select a reason"),
    customReason: z.string().optional(),
  })
  .refine(
    (data) => {
      // If "Other" is selected, customReason must be provided and valid
      if (data.reason === "Other") {
        return (
          data.customReason &&
          data.customReason.trim().length >= 3 &&
          data.customReason.trim().length <= 200
        );
      }
      return true;
    },
    {
      message: "Custom reason must be between 3 and 200 characters",
      path: ["customReason"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

export const DeactiveTeacherModal = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const { isOpen, teacherId, onClose } = useDeactiveTeacher();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: "",
      customReason: "",
    },
  });

  const reasonValue = form.watch("reason");
  const customReasonValue = form.watch("customReason");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      form.reset();
      setButtonState("idle");
    }
  }, [isOpen, form]);

  const { mutate: deactiveTeacher, isPending } = useMutation(
    trpc.teacher.deactive.mutationOptions({
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
        queryClient.invalidateQueries({
          queryKey: trpc.teacher.getMany.queryKey(),
        });

        setTimeout(() => {
          onClose();
        }, 2000);
      },
    })
  );

  const onSubmit = (values: FormValues) => {
    const finalReason =
      values.reason === "Other" ? values.customReason!.trim() : values.reason;

    deactiveTeacher({ teacherId, reason: finalReason });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deactivation</DialogTitle>
          <DialogDescription>Deactive Teacher</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Select Reason <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Clear custom reason when switching away from "Other"
                      if (value !== "Other") {
                        form.setValue("customReason", "");
                      }
                    }}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
                        <SelectValue placeholder="Select Reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TeacherDeactivationReasons.map((item, index) => (
                        <SelectItem value={item} key={index}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {reasonValue === "Other" && (
              <FormField
                control={form.control}
                name="customReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Custom Reason <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter custom reason"
                        disabled={isPending}
                        className="w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {customReasonValue?.length || 0}/200 characters
                    </p>
                  </FormItem>
                )}
              />
            )}

            <LoadingButton
              type="submit"
              state={buttonState}
              onStateChange={setButtonState}
              className="w-full rounded-full"
              icon={Send}
              disabled={isPending}
            >
              Deactive
            </LoadingButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
