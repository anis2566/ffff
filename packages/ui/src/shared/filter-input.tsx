"use client";

import { useEffect, useState } from "react";

import { Input } from "../components/input";

import { useDebounce } from "../hooks/use-debounce";
import { cn } from "../lib/utils";
import { useIsMobile } from "../hooks/use-mobile";

interface FilterInputProps {
  type: "search" | "text" | "number";
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  showInMobile?: boolean;
  className?: string;
}

export const FilterInput = ({
  type,
  placeholder,
  value,
  onChange,
  showInMobile = false,
  className,
}: FilterInputProps) => {
  const [search, setSearch] = useState<string>(value || "");

  const isMobile = useIsMobile();
  const debounceSearchValue = useDebounce(search, 500);

  useEffect(() => {
    onChange(debounceSearchValue);
  }, [debounceSearchValue]);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  return (
    <Input
      type={type}
      placeholder={placeholder}
      className={cn(
        "w-full max-w-[250px] bg-background dark:bg-background rounded-xs shadow-none",
        !showInMobile && isMobile && "hidden",
        className
      )}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  );
};
