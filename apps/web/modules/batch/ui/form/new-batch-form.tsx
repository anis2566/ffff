"use client";

import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/react";

import { BatchSchema, BatchSchemaType } from "@workspace/utils/schemas";
import { LEVELS } from "@workspace/utils/constant";

import { FormCardWrapper } from "@workspace/ui/shared/form-card-wrapper";
import { FormInput } from "@workspace/ui/shared/form-input";
import { FormSelect } from "@workspace/ui/shared/form-select";
import {
  ButtonState,
  LoadingButton,
} from "@workspace/ui/shared/loadign-button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import { MultiSelect } from "@workspace/ui/components/multi-select";
import {
  Collapsible,
  CollapsibleContent,
} from "@workspace/ui/components/collapsible";
import { Badge } from "@workspace/ui/components/badge";

import { useGetBatches } from "../../filters/use-get-batches";

export const NewBatchForm = () => {
  const [buttonState, setButtonState] = useState<ButtonState>("idle");
  const [errorText, setErrorText] = useState<string>("");
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [searchRoom, setSearchRoom] = useState<string>("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [classTimes, setClassTimes] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string[]>([]);

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters] = useGetBatches();

  const [roomsQuery, classesQuery] = useQueries({
    queries: [
      trpc.room.forSelect.queryOptions({ query: searchRoom }),
      trpc.class.forSelect.queryOptions({ search: "" }),
    ],
  });

  const { data: rooms, isLoading } = roomsQuery;
  const { data: classes } = classesQuery;

  const { mutate: createBatch, isPending } = useMutation(
    trpc.batch.createOne.mutationOptions({
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
          trpc.batch.getMany.queryOptions({ ...filters })
        );
        router.push("/batch");
      },
    })
  );

  const handleRoomChange = (value: string) => {
    const formValue = form.getValues("roomId");

    if (formValue === value) {
      form.setValue("roomId", "");
      setSelectedRoom("");
      setAvailableTimes([]);
      setOpen(false);
    } else {
      form.setValue("roomId", value);
      const room = rooms?.find((room) => room.id === value);
      setSelectedRoom(room?.name?.toString() || "");
      setAvailableTimes(room?.availableTimes || []);
      setOpen(false);
    }
  };

  const handleAddClassTime = () => {
    setClassTimes(classTimes.filter((time) => !selectedTime.includes(time)));
    setSelectedTime([]);
    if (
      selectedTime &&
      selectedTime.length > 0 &&
      selectedTime[0] &&
      selectedTime[selectedTime.length - 1]
    ) {
      form.setValue("classTime", [
        ...form.watch("classTime"),
        `${selectedTime[0]?.split("-")[0] ?? ""} - ${selectedTime[selectedTime.length - 1]?.split("-")[1] ?? ""}`,
      ]);
    }
  };

  const form = useForm<BatchSchemaType>({
    resolver: zodResolver(BatchSchema),
    defaultValues: {
      name: "",
      classNameId: "",
      capacity: "",
      level: "",
      roomId: "",
      time: [],
      classTime: [],
    },
  });

  const onSubmit = (data: BatchSchemaType) => {
    console.log(data);
    setButtonState("loading");
    createBatch(data);
  };

  return (
    <FormCardWrapper
      title="Set Up Your Batch"
      description="Enter the batch information to get started quickly."
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            form={form}
            name="name"
            label="Name"
            type="text"
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="classNameId"
            label="Class"
            placeholder="Select class"
            options={(classes || []).map((classItem) => ({
              label: classItem.name,
              value: classItem.id,
            }))}
            disabled={isPending}
          />
          <FormInput
            form={form}
            name="capacity"
            label="Capacity"
            type="number"
            disabled={isPending}
          />
          <FormSelect
            form={form}
            name="level"
            label="Level"
            placeholder="Select level"
            options={Object.values(LEVELS).map((house) => ({
              label: house,
              value: house,
            }))}
            disabled={isPending}
          />
          <FormField
            control={form.control}
            name="roomId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <Popover open={open} onOpenChange={setOpen}>
                  <FormControl>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex justify-start w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background"
                        disabled={isPending}
                      >
                        {selectedRoom ? selectedRoom : "Select room"}
                      </Button>
                    </PopoverTrigger>
                  </FormControl>
                  <PopoverContent
                    className={cn("w-auto min-w-[400px] rounded-xs")}
                  >
                    <div className="space-y-4">
                      <Input
                        type="search"
                        placeholder="Search room"
                        className="w-full bg-background dark:bg-background shadow-none"
                        value={searchRoom}
                        onChange={(e) => setSearchRoom(e.target.value)}
                      />

                      <div className="space-y-2">
                        {isLoading && (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}

                        {!isLoading &&
                          rooms?.map((item) => (
                            <div
                              key={item.id}
                              className={cn(
                                "flex justify-between items-center hover:bg-muted/80 cursor-pointer p-2 rounded-xs",
                                field.value === item.id && "bg-muted"
                              )}
                            >
                              <Label
                                className="flex flex-1 items-center gap-x-2"
                                htmlFor={String(item.id)}
                              >
                                <span className={cn("text-sm truncate")}>
                                  {item.name}
                                </span>
                              </Label>

                              <Checkbox
                                checked={field.value === item.id}
                                id={String(item.id)}
                                onCheckedChange={() => {
                                  handleRoomChange(item.id);
                                }}
                              />
                            </div>
                          ))}

                        {!isLoading && (!rooms || rooms.length === 0) && (
                          <div className="text-center text-muted-foreground py-4">
                            No items found
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <Collapsible open={availableTimes.length !== 0}>
            <CollapsibleContent className="space-y-4">
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <MultiSelect
                        options={availableTimes.map((time) => ({
                          label: time,
                          value: time,
                        }))}
                        selected={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                          setClassTimes(value);
                          setSelectedTime([]);
                          form.setValue("classTime", []);
                        }}
                        defaultValue={field.value}
                        placeholder="Select time"
                        variant="inverted"
                        animation={2}
                        maxCount={3}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classTime"
                render={() => (
                  <FormItem>
                    <FormLabel>Class Time</FormLabel>
                    <div className="flex items-center gap-x-3">
                      <MultiSelect
                        options={classTimes.map((time) => ({
                          label: time,
                          value: time,
                        }))}
                        selected={selectedTime}
                        onChange={(value) => {
                          setSelectedTime(value);
                        }}
                        defaultValue={selectedTime}
                        placeholder="select class time"
                        variant="inverted"
                        animation={2}
                        maxCount={3}
                        disabled={isPending}
                        className="flex flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddClassTime()}
                        disabled={selectedTime.length === 0}
                      >
                        Add
                      </Button>
                    </div>
                    <div className="flex items-center gap-x-3 pt-1">
                      {form.watch("classTime").map((v, i) => (
                        <Badge key={i} variant="outline">
                          {v}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CollapsibleContent>
          </Collapsible>

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
