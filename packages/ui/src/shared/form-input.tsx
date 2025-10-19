import { FieldValues, Path, Controller } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import { Input } from "../components/input";

interface FormInputProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  disabled?: boolean;
}

export function FormInput<T extends FieldValues>({
  form,
  name,
  label,
  type = "text",
  placeholder,
  disabled = false,
}: FormInputProps<T>) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full bg-background dark:bg-background rounded-xs shadow-none"
            />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
