"use client";

import { Filter } from "lucide-react";
import { useCallback, useState } from "react";

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
  GROUPS,
  LEVELS,
  Session,
} from "@workspace/utils/constant";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Separator } from "@workspace/ui/components/separator";

import { useGetSubjects } from "../../filters/use-get-subjects";

const LEVEL_OPTIONS = Object.values(LEVELS).map((v) => ({
  label: v,
  value: v,
}));
const GROUP_OPTIONS = Object.values(GROUPS).map((v) => ({
  label: v,
  value: v,
}));
const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

export const MobileFilter = () => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useGetSubjects();

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== DEFAULT_PAGE_SIZE ||
    filter.page !== DEFAULT_PAGE ||
    !!filter.sort ||
    !!filter.level ||
    !!filter.group ||
    !!filter.session;

  const createFilterHandler = useCallback(
    (key: string, transform?: (value: string) => any) => (value: string) => {
      try {
        setFilter({ [key]: transform ? transform(value) : value });
      } catch (error) {
        console.error(`Error setting ${key}:`, error);
      } finally {
        setOpen(false);
      }
    },
    [setFilter]
  );

  const handleSortChange = useCallback(
    () => createFilterHandler("sort"),
    [createFilterHandler]
  );

  const handleLimitChange = useCallback(
    () => createFilterHandler("limit", (v) => parseInt(v, 10)),
    [createFilterHandler]
  );

  const handleLevelChange = useCallback(
    () => createFilterHandler("level"),
    [createFilterHandler]
  );

  const handleSessionChange = useCallback(
    () => createFilterHandler("session"),
    [createFilterHandler]
  );

  const handleGroupChange = useCallback(
    () => createFilterHandler("group"),
    [createFilterHandler]
  );

  const handleClear = useCallback(() => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      level: "",
      session: "",
      group: "",
    });
  }, [setFilter]);

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
            value={filter.level}
            onChange={handleLevelChange}
            placeholder="Level"
            options={LEVEL_OPTIONS}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.group}
            onChange={handleGroupChange}
            placeholder="Group"
            options={GROUP_OPTIONS}
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
            options={Object.values(DEFAULT_SORT_OPTIONS)}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.limit.toString()}
            onChange={handleLimitChange}
            placeholder="Limit"
            options={Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
              label: v.toString(),
              value: v.toString(),
            }))}
            className="max-w-full"
            showInMobile
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
