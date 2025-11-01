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
  Session,
} from "@workspace/utils/constant";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Separator } from "@workspace/ui/components/separator";
import { FilterInput } from "@workspace/ui/shared/filter-input";

import { useGetStudents } from "../../filters/use-get-students";

interface MobileFilterProps {
  classes: {
    name: string;
  }[];
}

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

export const MobileFilter = ({ classes }: MobileFilterProps) => {
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useGetStudents();

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.session !== "" ||
    filter.className !== "" ||
    filter.id !== "";

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

  const handleIdChange = useCallback(
    (value: string) => setFilter({ id: value }),
    [setFilter]
  );

  const handleClassChange = useCallback(
    (value: string) => setFilter({ className: value }),
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

  const handleSessionChange = useCallback(
    () => createFilterHandler("session"),
    [createFilterHandler]
  );

  const handleClear = useCallback(() => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      session: "",
      className: "",
      id: "",
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
          <FilterInput
            type="search"
            placeholder="id..."
            value={filter.id}
            onChange={handleIdChange}
            showInMobile
            className="max-w-full rounded-md"
          />
          <FilterSelect
            value={filter.className}
            onChange={handleClassChange}
            placeholder="Class"
            options={classes.map((v) => ({
              label: v.name,
              value: v.name,
            }))}
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
            value={""}
            onChange={handleLimitChange}
            placeholder="Limit"
            options={PAGE_SIZE_OPTIONS}
            className="max-w-full"
            showInMobile
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
