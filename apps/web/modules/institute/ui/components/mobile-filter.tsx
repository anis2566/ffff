"use client";

import { Filter } from "lucide-react";
import { useState, useCallback } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  INSTITUTE_TYPES,
  Session,
} from "@workspace/utils/constant";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Separator } from "@workspace/ui/components/separator";

import { useGetInstitutes } from "../../filters/use-get-institutes";

// Memoize options outside component
const TYPE_OPTIONS = Object.values(INSTITUTE_TYPES).map((v) => ({
  label: v,
  value: v,
}));

const LIMIT_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));

const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

const DEFAULT_FILTERS = {
  search: "",
  limit: DEFAULT_PAGE_SIZE,
  page: DEFAULT_PAGE,
  sort: "",
  type: "",
  session: "",
} as const;

export const MobileFilter = () => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useGetInstitutes();

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== DEFAULT_PAGE_SIZE ||
    filter.page !== DEFAULT_PAGE ||
    !!filter.sort ||
    !!filter.type ||
    !!filter.session;

  const handleClear = useCallback(() => {
    setFilter(DEFAULT_FILTERS);
  }, [setFilter]);

  const handleTypeChange = useCallback(
    (value: string) => {
      setFilter({ type: value });
      setOpen(false);
    },
    [setFilter]
  );

  const handleSessionChange = useCallback(
    (value: string) => {
      setFilter({ session: value });
      setOpen(false);
    },
    [setFilter]
  );

  const handleSortChange = useCallback(
    (value: string) => {
      setFilter({ sort: value });
      setOpen(false);
    },
    [setFilter]
  );

  const handleLimitChange = useCallback(
    (value: string) => {
      setFilter({ limit: parseInt(value, 10) });
      setOpen(false);
    },
    [setFilter]
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" className="rounded-xs md:hidden">
          <Filter />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle>Filter</DrawerTitle>
        </DrawerHeader>
        <div className="flex items-center justify-between">
          <ResetFilter hasModified={hasAnyModified} handleReset={handleClear} />
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Close
            </Button>
          </DrawerClose>
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col gap-4">
          <FilterSelect
            value={filter.type}
            onChange={handleTypeChange}
            placeholder="Type"
            options={TYPE_OPTIONS}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.session}
            onChange={handleSessionChange}
            placeholder="Session"
            options={Session}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.sort}
            onChange={handleSortChange}
            placeholder="Sort"
            options={SORT_OPTIONS}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.limit.toString()}
            onChange={handleLimitChange}
            placeholder="Limit"
            options={LIMIT_OPTIONS}
            className="max-w-full"
            showInMobile
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
