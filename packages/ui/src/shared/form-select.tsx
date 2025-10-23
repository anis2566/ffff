import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ComponentProps } from "react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/select";

interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FormSelectProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  placeholder: string;
  options: SelectOption[];
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  selectProps?: Omit<
    ComponentProps<typeof Select>,
    "onValueChange" | "defaultValue" | "disabled" | "value"
  >;
}

export function FormSelect<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  onValueChange,
  className,
  triggerClassName,
  contentClassName,
  selectProps,
}: FormSelectProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              onValueChange?.(value);
            }}
            value={field.value}
            disabled={disabled}
            {...selectProps}
          >
            <FormControl>
              <SelectTrigger className={triggerClassName}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className={contentClassName}>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
