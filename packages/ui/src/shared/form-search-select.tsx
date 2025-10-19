import { Control, FieldPath, FieldValues } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../components/form";
import { Popover, PopoverContent, PopoverTrigger } from "../components/popover";
import { Button } from "../components/button";
import { Input } from "../components/input";
import { Label } from "../components/label";
import { Badge } from "../components/badge";
import { Checkbox } from "../components/checkbox";

import { cn } from "../lib/utils";

export interface SearchSelectItem {
  id: string | number;
  name: string;
  displayId?: string | number; // For badge display (like teacherId)
  [key: string]: any; // Allow additional properties
}

export interface SearchSelectConfig {
  nameSearchPlaceholder?: string;
  idSearchPlaceholder?: string;
  selectPlaceholder?: string;
  showNameSearch?: boolean;
  showIdSearch?: boolean;
  showBadge?: boolean;
  minWidth?: string;
  maxNameWidth?: string;
}

interface SearchSelectFieldProps<T extends FieldValues> {
  // Form props
  control: Control<T>;
  name: FieldPath<T>;
  label: string;

  // Data props
  items: SearchSelectItem[];
  isLoading?: boolean;

  // Search props
  nameSearchValue: string;
  onNameSearchChange: (value: string) => void;
  idSearchValue?: string;
  onIdSearchChange?: (value: string) => void;

  // Selection props
  selectedItemName?: string;
  onSelectionChange: (id: string | number) => void;

  // UI Configuration
  config?: SearchSelectConfig;

  // State
  isPending?: boolean;
}

const defaultConfig: SearchSelectConfig = {
  nameSearchPlaceholder: "Search by name...",
  idSearchPlaceholder: "Search by id...",
  selectPlaceholder: "Select item",
  showNameSearch: true,
  showIdSearch: true,
  showBadge: true,
  minWidth: "400px",
  maxNameWidth: "150px",
};

export function FormSearchSelect<T extends FieldValues>({
  control,
  name,
  label,
  items,
  isLoading = false,
  nameSearchValue,
  onNameSearchChange,
  idSearchValue,
  onIdSearchChange,
  selectedItemName,
  onSelectionChange,
  config = {},
  isPending = false,
}: SearchSelectFieldProps<T>) {
  const finalConfig = { ...defaultConfig, ...config };
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-y-2">
          <FormLabel>{label}</FormLabel>
          <Popover>
            <FormControl>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="flex justify-start w-full rounded-xs shadow-none dark:bg-background dark:hover:bg-background"
                  disabled={isPending}
                >
                  {selectedItemName || finalConfig.selectPlaceholder}
                </Button>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent
              className={cn(
                "w-auto",
                finalConfig.minWidth && `min-w-[${finalConfig.minWidth}]`
              )}
            >
              <div className="space-y-4">
                {/* Name Search Input */}
                {finalConfig.showNameSearch && (
                  <Input
                    type="search"
                    placeholder={finalConfig.nameSearchPlaceholder}
                    className="w-full bg-background dark:bg-background shadow-none"
                    value={nameSearchValue}
                    onChange={(e) => onNameSearchChange(e.target.value)}
                  />
                )}

                {/* ID Search Input */}
                {finalConfig.showIdSearch && (
                  <Input
                    type="number"
                    placeholder={finalConfig.idSearchPlaceholder}
                    className="w-full bg-background dark:bg-background shadow-none"
                    value={idSearchValue}
                    onChange={(e) => onIdSearchChange?.(e.target.value)}
                  />
                )}

                {/* Items List */}
                <div className="space-y-2">
                  {isLoading && (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}

                  {!isLoading &&
                    items?.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "flex justify-between items-center hover:bg-muted/80 cursor-pointer p-2 rounded-xs",
                          field.value === item.id && "bg-muted"
                        )}
                      >
                        {/* Badge (optional) */}
                        {finalConfig.showBadge && item.displayId && (
                          <Badge variant="default" className="mr-2">
                            {item.displayId}
                          </Badge>
                        )}

                        {/* Item Name */}
                        <Label
                          className="flex flex-1 items-center gap-x-2"
                          htmlFor={String(item.id)}
                        >
                          <span
                            className={cn(
                              "text-sm truncate",
                              finalConfig.maxNameWidth &&
                                `max-w-[${finalConfig.maxNameWidth}]`
                            )}
                          >
                            {item.name}
                          </span>
                        </Label>

                        {/* Checkbox */}
                        <Checkbox
                          checked={field.value === item.id}
                          id={String(item.id)}
                          onCheckedChange={() => onSelectionChange(item.id)}
                        />
                      </div>
                    ))}

                  {/* No items message */}
                  {!isLoading && (!items || items.length === 0) && (
                    <div className="text-center text-muted-foreground py-4">
                      No items found
                    </div>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
