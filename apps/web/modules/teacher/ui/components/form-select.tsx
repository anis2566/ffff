import { FieldValues, Path, Controller, UseFormTrigger } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface FormInputProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  placeholder: string;
  options: {
    label: string;
    value: string;
  }[];
  trigger: UseFormTrigger<T>;
}

export function FormSelect<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  options,
  disabled = false,
  trigger,
}: FormInputProps<T>) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={(value) => {
              field.onChange(value);
              trigger(name);
            }}
            disabled={disabled}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent className="rounded-xs">
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="rounded-xs"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
