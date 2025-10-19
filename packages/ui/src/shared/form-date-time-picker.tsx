import { FieldValues, Path, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
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
import { Input } from "../components/input";
import { Label } from "../components/label";
import { cn } from "../lib/utils";

interface FormCalendarProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  placeholder?: string;
  disableFuture?: boolean;
  disablePast?: boolean;
  showTime?: boolean;
  timeFormat?: "12h" | "24h";
}

export function FormDateTimePicker<T extends FieldValues>({
  form,
  name,
  label,
  placeholder = "Pick a date",
  disabled = false,
  disableFuture = false,
  disablePast = false,
  showTime = false,
  timeFormat = "24h",
}: FormCalendarProps<T>) {
  const [open, setOpen] = useState<boolean>(false);

  const handleDateSelect = (
    date: Date | undefined,
    currentValue: string,
    onChange: (value: string) => void
  ) => {
    if (!showTime) {
      onChange(date ? date.toISOString() : "");
      setOpen(false);
      return;
    }

    if (date) {
      const newDate = new Date(date);
      if (currentValue) {
        const existingDate = new Date(currentValue);
        newDate.setHours(existingDate.getHours());
        newDate.setMinutes(existingDate.getMinutes());
      }
      onChange(newDate.toISOString());
    } else {
      onChange("");
    }
  };

  const handleTimeChange = (
    type: "hours" | "minutes",
    value: string,
    currentValue: string,
    onChange: (value: string) => void
  ) => {
    if (!currentValue) return;

    const date = new Date(currentValue);
    const numValue = parseInt(value) || 0;

    if (type === "hours") {
      date.setHours(numValue);
    } else {
      date.setMinutes(numValue);
    }

    onChange(date.toISOString());
  };

  const handleAmPmChange = (
    period: "AM" | "PM",
    currentValue: string,
    onChange: (value: string) => void
  ) => {
    if (!currentValue) return;

    const date = new Date(currentValue);
    const currentHours = date.getHours();

    if (period === "AM" && currentHours >= 12) {
      date.setHours(currentHours - 12);
    } else if (period === "PM" && currentHours < 12) {
      date.setHours(currentHours + 12);
    }

    onChange(date.toISOString());
  };

  const get12HourFormat = (value: string) => {
    if (!value) return { hours: 12, minutes: 0, period: "AM" };

    const date = new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return {
      hours: hours === 0 ? 12 : hours > 12 ? hours - 12 : hours,
      minutes,
      period: hours >= 12 ? "PM" : "AM",
    };
  };

  const get24HourFormat = (value: string) => {
    if (!value) return { hours: 0, minutes: 0 };

    const date = new Date(value);
    return {
      hours: date.getHours(),
      minutes: date.getMinutes(),
    };
  };

  const formatDisplayValue = (value: string) => {
    if (!value) return placeholder;

    const date = new Date(value);

    if (showTime) {
      return timeFormat === "12h"
        ? format(date, "PPP p")
        : format(date, "PPP HH:mm");
    }

    return format(date, "PPP");
  };

  // Helper function to normalize date to start of day for comparison
  const normalizeDate = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

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
                  <span className="truncate">
                    {formatDisplayValue(field.value)}
                  </span>
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50 flex-shrink-0" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-xs" align="start">
              <Calendar
                mode="single"
                selected={field.value ? new Date(field.value) : undefined}
                onSelect={(date) =>
                  handleDateSelect(date, field.value, field.onChange)
                }
                disabled={(date) => {
                  if (disabled) return true;
                  
                  const today = normalizeDate(new Date());
                  const checkDate = normalizeDate(date);
                  
                  if (disableFuture && checkDate > today) return true;
                  if (disablePast && checkDate < today) return true;
                  
                  return false;
                }}
              />

              {showTime && field.value && (
                <div className="border-t p-3">
                  <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Time
                  </Label>

                  <div className="flex items-center gap-2">
                    {timeFormat === "12h" ? (
                      <>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="1"
                            max="12"
                            value={get12HourFormat(field.value).hours}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 1;
                              const clamped = Math.min(Math.max(val, 1), 12);
                              const { period } = get12HourFormat(field.value);
                              const hours24 =
                                period === "PM" && clamped !== 12
                                  ? clamped + 12
                                  : clamped === 12 && period === "AM"
                                    ? 0
                                    : clamped;
                              handleTimeChange(
                                "hours",
                                hours24.toString(),
                                field.value,
                                field.onChange
                              );
                            }}
                            className="text-center"
                            placeholder="HH"
                          />
                        </div>
                        <span className="text-xl font-medium">:</span>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={get12HourFormat(field.value)
                              .minutes.toString()
                              .padStart(2, "0")}
                            onChange={(e) =>
                              handleTimeChange(
                                "minutes",
                                e.target.value,
                                field.value,
                                field.onChange
                              )
                            }
                            className="text-center"
                            placeholder="MM"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant={
                              get12HourFormat(field.value).period === "AM"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() =>
                              handleAmPmChange(
                                "AM",
                                field.value,
                                field.onChange
                              )
                            }
                          >
                            AM
                          </Button>
                          <Button
                            type="button"
                            variant={
                              get12HourFormat(field.value).period === "PM"
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() =>
                              handleAmPmChange(
                                "PM",
                                field.value,
                                field.onChange
                              )
                            }
                          >
                            PM
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={get24HourFormat(field.value)
                              .hours.toString()
                              .padStart(2, "0")}
                            onChange={(e) =>
                              handleTimeChange(
                                "hours",
                                e.target.value,
                                field.value,
                                field.onChange
                              )
                            }
                            className="text-center"
                            placeholder="HH"
                          />
                        </div>
                        <span className="text-xl font-medium">:</span>
                        <div className="flex-1">
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={get24HourFormat(field.value)
                              .minutes.toString()
                              .padStart(2, "0")}
                            onChange={(e) =>
                              handleTimeChange(
                                "minutes",
                                e.target.value,
                                field.value,
                                field.onChange
                              )
                            }
                            className="text-center"
                            placeholder="MM"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}