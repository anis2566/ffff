import { FieldValues, Path, Controller } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import { Textarea } from "../components/textarea";

interface FormInputProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FormTextarea<T extends FieldValues>({
  form,
  name,
  label,
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
            <Textarea
              {...field}
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
