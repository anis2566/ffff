import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { Calendar } from "../components/calendar";
import { Button } from "../components/button";
import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";

interface FilterCalendarProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  showInMobile?: boolean;
  className?: string;
  disabled?: boolean;
  disableFuture?: boolean;
  disablePast?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const FilterCalendar = ({
  value,
  onChange,
  placeholder = "Pick a date",
  showInMobile = false,
  className,
  disabled = false,
  disableFuture = false,
  disablePast = false,
  minDate,
  maxDate,
}: FilterCalendarProps) => {
  const isMobile = useIsMobile();

  const getDisabledDates = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (disableFuture && date > today) return true;
    if (disablePast && date < today) return true;
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      // Normalize the date to avoid timezone issues
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12,
        0,
        0,
        0
      );
      onChange(normalizedDate);
    } else {
      onChange(undefined);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full max-w-[200px] rounded-xs shadow-none dark:bg-background dark:hover:bg-background justify-start text-left font-normal",
            !value && "text-muted-foreground",
            !showInMobile && isMobile && "hidden",
            className
          )}
          disabled={disabled}
        >
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xs" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateChange}
          disabled={getDisabledDates}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
};
