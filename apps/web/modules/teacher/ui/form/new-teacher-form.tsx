"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  DollarSign,
  Edit,
  Loader2,
  MapPin,
  PhoneCall,
  School,
  User,
  Clock,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/react";
import { useRouter } from "next/navigation";

import { Card } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { TeacherSchema, TeacherSchemaType } from "@workspace/utils/schemas";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { cn } from "@workspace/ui/lib/utils";
import { Separator } from "@workspace/ui/components/separator";
import { Badge } from "@workspace/ui/components/badge";
import {
  DAYS,
  GENDER,
  LEVELS,
  NATIONALITY,
  RELIGION,
  timeSlots,
} from "@workspace/utils/constant";
import { Input } from "@workspace/ui/components/input";

import { StepIndicator } from "../components/step-indicator";
import { FormInput } from "../components/form-input";
import { FormSelect } from "../components/form-select";
import { FormCalendar } from "../components/form-calendar";
import { FormMultiSelect } from "../components/form-multi-select";

// Constants
const STEPS = [
  {
    id: 1,
    name: "Personal Info",
    fields: [
      "name",
      "fName",
      "mName",
      "gender",
      "dob",
      "nationality",
      "religion",
    ] as const,
    Icon: User,
  },
  {
    id: 2,
    name: "Academic Info",
    fields: ["currentInstitution", "currentSubject"] as const,
    Icon: School,
  },
  {
    id: 3,
    name: "Address",
    fields: [
      "presentHouseNo",
      "presentMoholla",
      "presentPost",
      "presentThana",
      "permanentVillage",
      "permanentPost",
      "permanentThana",
      "permanentDistrict",
    ] as const,
    Icon: MapPin,
  },
  {
    id: 4,
    name: "Contact",
    fields: ["phone", "altPhone"] as const,
    Icon: PhoneCall,
  },
  {
    id: 5,
    name: "Availability",
    fields: ["availableTimes", "availableDays", "level"] as const,
    Icon: Clock,
  },
  {
    id: 6,
    name: "Rate & Details",
    fields: ["classRate", "teacherId"] as const,
    Icon: DollarSign,
  },
] as const;

// Form default values
const DEFAULT_VALUES: TeacherSchemaType = {
  name: "",
  fName: "",
  mName: "",
  dob: new Date().toISOString(),
  gender: "",
  nationality: NATIONALITY.Bangladeshi,
  religion: RELIGION.Islam,
  imageUrl: "",
  presentHouseNo: "",
  presentMoholla: "",
  presentPost: "",
  presentThana: "",
  permanentVillage: "",
  permanentPost: "",
  permanentThana: "",
  permanentDistrict: "",
  phone: "",
  altPhone: "",
  currentInstitution: "",
  currentSubject: "",
  level: [],
  availableTimes: [],
  availableDays: [],
  classRate: "",
  teacherId: "",
};

// Select options - memoized to prevent re-creation
const SELECT_OPTIONS = {
  gender: Object.values(GENDER).map((v) => ({ label: v, value: v })),
  nationality: Object.values(NATIONALITY).map((v) => ({ label: v, value: v })),
  religion: Object.values(RELIGION).map((v) => ({ label: v, value: v })),
  levels: Object.values(LEVELS).map((v) => ({ label: v, value: v })),
  days: Object.values(DAYS).map((v) => ({ label: v, value: v })),
  times: Object.values(timeSlots).map((v) => ({ label: v, value: v })),
};

// Custom hook for teacher ID management
const useTeacherManagement = () => {
  const [editStates, setEditStates] = useState({
    classRate: false,
    teacherId: false,
  });

  const toggleEdit = useCallback((field: keyof typeof editStates) => {
    setEditStates((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const trpc = useTRPC();
  const counterQuery = useQuery(trpc.counter.getForTeacher.queryOptions());

  return {
    counter: counterQuery,
    editStates,
    toggleEdit,
  };
};

// Step content components
const PersonalInfoStep = ({ form, trigger, isPending }: StepProps) => (
  <div className="grid md:grid-cols-2 gap-6 items-start">
    <FormInput
      form={form}
      name="name"
      label="Full Name"
      type="text"
      trigger={trigger}
      disabled={isPending}
    />
    <FormInput
      form={form}
      name="fName"
      label="Father's Name"
      type="text"
      trigger={trigger}
      disabled={isPending}
    />
    <FormInput
      form={form}
      name="mName"
      label="Mother's Name"
      type="text"
      trigger={trigger}
      disabled={isPending}
    />

    <FormSelect
      form={form}
      name="gender"
      label="Gender"
      options={SELECT_OPTIONS.gender}
      placeholder="select gender"
      trigger={trigger}
      disabled={isPending}
    />

    <FormCalendar
      form={form}
      name="dob"
      label="Date of Birth"
      trigger={trigger}
      disabled={isPending}
    />

    <FormSelect
      form={form}
      name="nationality"
      label="Nationality"
      options={SELECT_OPTIONS.nationality}
      placeholder="select nationality"
      trigger={trigger}
      disabled={isPending}
    />

    <FormSelect
      form={form}
      name="religion"
      label="Religion"
      options={SELECT_OPTIONS.religion}
      placeholder="select religion"
      trigger={trigger}
      disabled={isPending}
    />
  </div>
);

const AcademicInfoStep = ({ form, trigger, isPending }: StepProps) => (
  <div className="grid md:grid-cols-2 gap-6 items-start">
    <FormInput
      form={form}
      name="currentInstitution"
      label="Current Institution"
      type="text"
      trigger={trigger}
      disabled={isPending}
    />

    <FormInput
      form={form}
      name="currentSubject"
      label="Subject/Specialization"
      type="text"
      trigger={trigger}
      disabled={isPending}
    />
  </div>
);

const AddressStep = ({ form, trigger, isPending }: StepProps) => (
  <div className="flex flex-col gap-y-4">
    <div className="flex items-center">
      <div className="flex-1 h-px bg-muted" />
      <Badge variant="outline">Present Address</Badge>
      <div className="flex-1 h-px bg-muted" />
    </div>

    <div className="grid md:grid-cols-2 gap-6 items-start">
      <FormInput
        form={form}
        name="presentHouseNo"
        label="House No"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
      <FormInput
        form={form}
        name="presentMoholla"
        label="Moholla/Area"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
      <FormInput
        form={form}
        name="presentPost"
        label="Post Office"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
      <FormInput
        form={form}
        name="presentThana"
        label="Thana/Upazila"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
    </div>

    <div className="flex items-center">
      <div className="flex-1 h-px bg-muted" />
      <Badge variant="outline">Permanent Address</Badge>
      <div className="flex-1 h-px bg-muted" />
    </div>

    <div className="grid md:grid-cols-2 gap-6 items-start">
      <FormInput
        form={form}
        name="permanentVillage"
        label="Village/Area"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
      <FormInput
        form={form}
        name="permanentPost"
        label="Post Office"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
      <FormInput
        form={form}
        name="permanentThana"
        label="Thana/Upazila"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
      <FormInput
        form={form}
        name="permanentDistrict"
        label="District"
        type="text"
        trigger={trigger}
        disabled={isPending}
      />
    </div>
  </div>
);

const ContactStep = ({ form, trigger, isPending }: StepProps) => (
  <div className="grid md:grid-cols-2 gap-6 items-start">
    <FormInput
      form={form}
      name="phone"
      label="Primary Phone"
      type="text"
      trigger={trigger}
      disabled={isPending}
    />
    <FormInput
      form={form}
      name="altPhone"
      label="Alternative Phone"
      type="text"
      trigger={trigger}
      disabled={isPending}
    />
  </div>
);

const AvailabilityStep = ({ form, trigger, isPending }: StepProps) => (
  <div className="grid md:grid-cols-2 gap-6 items-start">
    <FormMultiSelect
      form={form}
      name="availableDays"
      label="Available Days"
      options={Object.values(DAYS)}
      placeholder="Select days"
      trigger={trigger}
      disabled={isPending}
    />

    <FormMultiSelect
      form={form}
      name="availableTimes"
      label="Available Time"
      options={timeSlots}
      placeholder="Select times"
      trigger={trigger}
      disabled={isPending}
    />

    <FormMultiSelect
      form={form}
      name="level"
      label="Level"
      options={Object.values(LEVELS)}
      placeholder="Select level"
      trigger={trigger}
      disabled={isPending}
    />
  </div>
);

const EditableField = ({
  form,
  name,
  label,
  type = "text",
  isEditable,
  onToggleEdit,
  isPending,
  trigger,
}: EditableFieldProps) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="relative">
            <Input
              {...field}
              value={field.value}
              onChange={(e) => {
                field.onChange(e.target.value);
                trigger(name);
              }}
              type={type}
              disabled={!isEditable || isPending}
              className={cn(
                "w-full bg-background dark:bg-background rounded-xs shadow-none",
                !isEditable && "bg-background/40 dark:bg-background/40"
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0"
              type="button"
              onClick={onToggleEdit}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const RateDetailsStep = ({
  form,
  trigger,
  isPending,
  editStates,
  toggleEdit,
  isCreating,
}: RateDetailsStepProps) => (
  <div className="grid md:grid-cols-2 gap-6 items-start">
    <EditableField
      form={form}
      name="classRate"
      label="Class Rate (per hour)"
      type="number"
      isEditable={editStates.classRate}
      onToggleEdit={() => toggleEdit("classRate")}
      isPending={isPending || isCreating}
      trigger={trigger}
    />

    <EditableField
      form={form}
      name="teacherId"
      label="Teacher ID"
      type="number"
      isEditable={editStates.teacherId}
      onToggleEdit={() => toggleEdit("teacherId")}
      isPending={isPending || isCreating}
      trigger={trigger}
    />
  </div>
);

// Types
type FieldName = keyof z.infer<typeof TeacherSchema>;

interface StepProps {
  form: any;
  trigger: any;
  isPending: boolean;
}

interface EditableFieldProps extends StepProps {
  name: keyof TeacherSchemaType;
  label: string;
  type?: string;
  isEditable: boolean;
  onToggleEdit: () => void;
}

interface RateDetailsStepProps extends StepProps {
  editStates: {
    classRate: boolean;
    teacherId: boolean;
  };
  toggleEdit: (field: keyof RateDetailsStepProps["editStates"]) => void;
  isCreating: boolean;
}

export const NewTeacherForm = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  // const [filters] = useGetTeachers();

  const { mutate: createTeacher, isPending } = useMutation(
    trpc.teacher.createOne.mutationOptions({
      onError: (err) => {
        toast.error(err.message);
      },
      onSuccess: async (data) => {
        if (!data.success) {
          toast.error(data.message);
          return;
        }
        toast.success(data.message);
        // queryClient.invalidateQueries(trpc.teacher.getMany.queryOptions({ ...filters }))
        router.push("/teacher")
      },
    })
  );

  const form = useForm<TeacherSchemaType>({
    resolver: zodResolver(TeacherSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  const { watch, trigger, handleSubmit, setValue } = form;

  const { counter, editStates, toggleEdit } = useTeacherManagement();

  // Auto-populate teacher ID
  useEffect(() => {
    if (counter?.data?.count !== undefined && !editStates.teacherId) {
      setValue("teacherId", (counter?.data?.count || 0).toString());
      trigger("teacherId");
    }
  }, [counter?.data?.count, setValue, trigger, editStates.teacherId]);

  // Navigation handlers
  const handleNext = useCallback(async () => {
    if (currentStep >= STEPS.length) return;

    const step = STEPS[currentStep - 1];
    if (!step) return;

    const output = await trigger([...step.fields] as FieldName[], {
      shouldFocus: true,
    });
    if (!output) return;

    setCurrentStep((s) => Math.min(s + 1, STEPS.length));
  }, [currentStep, trigger]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  }, []);

  const onSubmit = useCallback(
    (data: TeacherSchemaType) => {
      createTeacher(data);
    },
    [createTeacher]
  );

  // Render step content
  const renderStepContent = useMemo(() => {
    const stepProps = { form, trigger, isPending: false };

    switch (currentStep) {
      case 1:
        return <PersonalInfoStep {...stepProps} />;
      case 2:
        return <AcademicInfoStep {...stepProps} />;
      case 3:
        return <AddressStep {...stepProps} />;
      case 4:
        return <ContactStep {...stepProps} />;
      case 5:
        return <AvailabilityStep {...stepProps} />;
      case 6:
        return (
          <RateDetailsStep
            {...stepProps}
            editStates={editStates}
            toggleEdit={toggleEdit}
            isCreating={isPending}
          />
        );
      default:
        return null;
    }
  }, [currentStep, form, trigger, editStates, toggleEdit, isPending]);

  const stepIndicatorSteps = useMemo(
    () => STEPS.map((step) => ({ title: step.name, icon: step.Icon })),
    []
  );

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card px-2 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
      <Card className="rounded-xs px-3">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Teacher Registration Form
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Fill out the form below to register a new teacher.
            </p>
          </div>
        </div>

        <StepIndicator steps={stepIndicatorSteps} currentStep={currentStep} />

        <Separator className="my-2" />

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>{renderStepContent}</form>
        </Form>

        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {STEPS.length}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isPending}
              className="rounded-full"
            >
              Previous
            </Button>
            <Button
              onClick={
                currentStep === STEPS.length
                  ? handleSubmit(onSubmit)
                  : handleNext
              }
              type={currentStep === STEPS.length ? "submit" : "button"}
              disabled={isPending}
              className="rounded-full"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : currentStep === STEPS.length ? (
                "Register Teacher"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
