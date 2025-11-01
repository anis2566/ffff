import { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { ComponentProps } from "react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import { Input } from "../components/input";
import { cn } from "../lib/utils";

interface FormInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  type?: ComponentProps<"input">["type"];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputProps?: Omit<
    ComponentProps<"input">,
    | "name"
    | "type"
    | "placeholder"
    | "disabled"
    | "value"
    | "onChange"
    | "onBlur"
    | "ref"
  >;
}

export function FormInput<T extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  disabled = false,
  className,
  inputProps,
}: FormInputProps<T>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              {...inputProps}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "w-full bg-background dark:bg-background rounded-xs shadow-none",
                className
              )}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
