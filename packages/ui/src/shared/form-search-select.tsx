import { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

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
  displayId?: string | number;
  [key: string]: any;
}

export interface SearchSelectConfig {
  nameSearchPlaceholder?: string;
  selectPlaceholder?: string;
  showNameSearch?: boolean;
  showBadge?: boolean;
  minWidth?: string;
  maxNameWidth?: string;
}

interface SearchSelectFieldProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: FieldPath<T>;
  label: string;
  items: SearchSelectItem[];
  isLoading?: boolean;
  config?: SearchSelectConfig;
  disabled?: boolean;
}

const DEFAULT_CONFIG: SearchSelectConfig = {
  nameSearchPlaceholder: "Search by name...",
  selectPlaceholder: "Select item",
  showNameSearch: true,
  showBadge: true,
  minWidth: "400px",
  maxNameWidth: "150px",
} as const;

export function FormSearchSelect<T extends FieldValues>({
  form,
  name,
  label,
  items = [],
  isLoading = false,
  config,
  disabled = false,
}: SearchSelectFieldProps<T>) {
  const [nameSearchValue, setNameSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const finalConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );

  // Filter items based on search value
  const filteredItems = useMemo(() => {
    if (!nameSearchValue.trim()) {
      return items;
    }

    return items.filter((item) =>
      item.name.toLowerCase().includes(nameSearchValue.toLowerCase())
    );
  }, [items, nameSearchValue]);

  // Get selected item name from field value
  const getSelectedItemName = (fieldValue: any) => {
    if (!fieldValue) return null;

    const selectedItem = items.find((item) => item.id === fieldValue);
    return selectedItem?.name || null;
  };

  const hasItems = filteredItems.length > 0;
  const showNoResults = !isLoading && !hasItems;

  const handleSelectionChange = (id: string | number) => {
    form.setValue(name, id as any, { shouldValidate: true, shouldDirty: true });
    setOpen(false);
    setNameSearchValue("");
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-y-2">
          <FormLabel>{label}</FormLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <FormControl>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="justify-start w-full"
                  disabled={disabled}
                  type="button"
                >
                  {getSelectedItemName(field.value) ||
                    finalConfig.selectPlaceholder}
                </Button>
              </PopoverTrigger>
            </FormControl>
            <PopoverContent
              className="w-auto p-4"
              style={{ minWidth: finalConfig.minWidth }}
            >
              <div className="space-y-4">
                {/* Name Search Input */}
                {finalConfig.showNameSearch && (
                  <Input
                    type="search"
                    placeholder={finalConfig.nameSearchPlaceholder}
                    value={nameSearchValue}
                    onChange={(e) => setNameSearchValue(e.target.value)}
                    autoFocus
                  />
                )}

                {/* Items List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {isLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  )}

                  {!isLoading &&
                    filteredItems.map((item) => {
                      const isSelected = field.value === item.id;

                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center gap-x-2 hover:bg-muted/80 cursor-pointer p-2 rounded-md transition-colors",
                            isSelected && "bg-muted"
                          )}
                          onClick={() => handleSelectionChange(item.id)}
                        >
                          {/* Badge (optional) */}
                          {finalConfig.showBadge && item.displayId && (
                            <Badge variant="default">{item.displayId}</Badge>
                          )}

                          {/* Item Name */}
                          <Label
                            className="flex-1 cursor-pointer"
                            htmlFor={`item-${item.id}`}
                          >
                            <span
                              className="text-sm truncate block"
                              style={{ maxWidth: finalConfig.maxNameWidth }}
                            >
                              {item.name}
                            </span>
                          </Label>

                          {/* Checkbox */}
                          <Checkbox
                            checked={isSelected}
                            id={`item-${item.id}`}
                            onCheckedChange={() =>
                              handleSelectionChange(item.id)
                            }
                          />
                        </div>
                      );
                    })}

                  {/* No items message */}
                  {showNoResults && (
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