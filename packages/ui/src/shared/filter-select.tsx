import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";

import { useIsMobile } from "../hooks/use-mobile";
import { cn } from "../lib/utils";

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: {
    label: string;
    value: string;
  }[];
  showInMobile?: boolean;
  className?: string;
}

export const FilterSelect = ({
  value,
  onChange,
  placeholder,
  options,
  showInMobile = false,
  className,
}: FilterSelectProps) => {
  const isMobile = useIsMobile();

  return (
    <Select value={value || ""} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "w-full max-w-[150px] rounded-xs shadow-none dark:bg-background dark:hover:bg-background",
          !showInMobile && isMobile && "hidden",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xs">
        {options.map((option, i) => (
          <SelectItem
            value={option.value}
            key={i}
            className="rounded-xs capitalize"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
