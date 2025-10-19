import { FieldValues, Path, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import { Calendar } from "../components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { Button } from "../components/button";
import { cn } from "../lib/utils";

interface FormCalendarProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
}

export function FormCalendar<T extends FieldValues>({
  form,
  name,
  label,
  placeholder = "Pick a date",
  disabled = false,
  disableFuture = false,
  disablePast = false,
}: FormCalendarProps<T>) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "PPP")
                  ) : (
                    <span>{placeholder}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xs" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) => {
                  field.onChange(date ? date.toISOString() : "");
                  setOpen(false);
                }}
                disabled={(date) => {
                  if (disabled) return true;
                  if (disableFuture && date > new Date()) return true;
                  if (disablePast && date < new Date()) return true;
                  return false;
                }}
              />
            </PopoverContent>
          </Popover>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
