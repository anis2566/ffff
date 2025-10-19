import { FieldValues, Path, Controller } from "react-hook-form";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import { MultiSelect } from "../components/multi-select";

interface FormInputProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  disabled?: boolean;
  placeholder: string;
  options: string[];
}

export function FormMultiSelect<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  options,
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
            <MultiSelect
              options={options.map((option) => ({
                label: option,
                value: option,
              }))}
              selected={field.value}
              onChange={field.onChange}
              defaultValue={field.value}
              placeholder={placeholder}
              variant="inverted"
              animation={2}
              maxCount={3}
              disabled={disabled}
            />
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
