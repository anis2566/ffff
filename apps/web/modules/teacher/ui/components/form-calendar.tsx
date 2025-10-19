import { FieldValues, Path, Controller, UseFormTrigger } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Calendar } from "@workspace/ui/components/calendar";
import { Button } from "@workspace/ui/components/button";

import { cn } from "@workspace/ui/lib/utils";

interface FormCalendarProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  trigger: UseFormTrigger<T>;
}

export function FormCalendar<T extends FieldValues>({
  form,
  name,
  label,
  disabled = false,
  trigger,
}: FormCalendarProps<T>) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={disabled}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xs" align="start">
              <Calendar
                mode="single"
                selected={new Date(field.value)}
                onSelect={(vlaue) => {
                  field.onChange(vlaue?.toDateString());
                  trigger(name);
                }}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                captionLayout="dropdown"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
