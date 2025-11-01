"use client";

import { useTRPC } from "@/trpc/react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { DollarSign, User } from "lucide-react";
import z from "zod";
import { useRouter } from "next/navigation";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import { Form } from "@workspace/ui/components/form";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ADMISSION_PAYMENT_STATUS,
  PAYMENT_METHOD,
  SALARY_PAYMENT_STATUS,
} from "@workspace/utils/constant";
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormTextarea } from "@workspace/ui/shared/form-textarea";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";

interface EditAdmissionPaymentFormProps {
  id: string;
}

const formSchema = z.object({
  method: z.string().min(1, { message: "required" }),
  amount: z.string().min(1, { message: "required" }),
  paymentStatus: z.string().min(1, { message: "required" }),
  note: z.string().min(1, { message: "required" }),
});

const PAYMENT_METHOD_OPTIONS = Object.values(PAYMENT_METHOD).map((v) => ({
  value: v,
  label: v,
}));
const PAYMENT_STATUS_OPTIONS = Object.values(ADMISSION_PAYMENT_STATUS).map(
  (v) => ({
    value: v,
    label: v,
  })
);

export const EditAdmissionPaymentForm = ({
  id,
}: EditAdmissionPaymentFormProps) => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "",
      amount: "",
      paymentStatus: "",
      note: "",
    },
  });

  const { data: payment } = useSuspenseQuery(
    trpc.admissionPayment.getOne.queryOptions(id)
  );

  useEffect(() => {
    if (payment) {
      form.reset({
        method: payment.method || "",
        amount: payment?.paidAmount?.toString() || "",
        paymentStatus: payment.paymentStatus,
        note: payment.note || "",
      });
    }
  }, [form, payment]);

  const { mutate: updateSalary, isPending } = useMutation(
    trpc.admissionPayment.editOne.mutationOptions({
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
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.admissionPayment.getMany.queryKey(),
          }),
        ]);
        router.push("/fee/admission");
      },
    })
  );

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    updateSalary({
      id,
      ...data,
    });
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-xs p-3 gap-y-3 w-full overflow-hidden">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
              <AvatarImage src={payment?.student?.imageUrl || ""} />
              <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {payment?.student?.name
                  .split(" ")
                  .map((name) => name.charAt(0))
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-1">
              <div>
                <CardTitle className="text-xl font-bold">
                  {payment?.student?.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  Student ID: {payment?.student?.studentId} • Class:{" "}
                  {payment?.student?.className?.name}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <CardWrapper>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect
              form={form}
              name="method"
              label="Method"
              placeholder="Select method"
              options={PAYMENT_METHOD_OPTIONS}
              disabled={isPending}
            />
            <FormInput
              form={form}
              name="amount"
              label="Amount"
              type="number"
              disabled={isPending}
            />
            <FormSelect
              form={form}
              name="paymentStatus"
              label="Status"
              placeholder="Select status"
              options={PAYMENT_STATUS_OPTIONS}
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
              state={buttonState}
              onStateChange={setButtonState}
              className="rounded-full"
              icon={Send}
            >
              Update
            </LoadingButton>
          </form>
        </Form>
      </CardWrapper>
    </div>
  );
};
