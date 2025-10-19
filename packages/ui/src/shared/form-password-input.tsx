import { FieldValues, Path, Controller } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";

import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import { Input } from "../components/input";
import { Button } from "../components/button";

interface FormInputProps<T extends FieldValues> {
  form: any;
  name: Path<T>;
  label: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FormPasswordInput<T extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  disabled = false,
}: FormInputProps<T>) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const toggleShowPassword = useCallback(() => setShowPassword((current) => !current), []);

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <Input
                {...field}
                type={showPassword ? "text" : "password"}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-background dark:bg-background rounded-xs shadow-none"
              />
              <Button variant="ghost" className="absolute right-0 top-0" type="button" onClick={toggleShowPassword}>
                {
                  showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )
                }
              </Button>
            </div>
          </FormControl>
          <FormMessage>{fieldState.error?.message}</FormMessage>
        </FormItem>
      )}
    />
  );
}
