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
} from "@workspace/utils/constant";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Separator } from "@workspace/ui/components/separator";
import { FilterCalendar } from "@workspace/ui/shared/filter-calendar";

import { useGetExams } from "../../filters/use-get-exams";

interface MobileFilterProps {
  classes: {
    label: string;
    value: string;
  }[];
  batches: {
    label: string;
    value: string;
  }[];
  subjects: {
    label: string;
    value: string;
  }[];
  categories: {
    label: string;
    value: string;
  }[];
}

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

export const MobileFilter = ({
  classes,
  batches,
  subjects,
  categories,
}: MobileFilterProps) => {
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useGetExams();

  const hasAnyModified =
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.batchId !== "" ||
    filter.classNameId !== "" ||
    filter.subjectId !== "" ||
    filter.categoryId !== "" ||
    filter.date !== "";

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

  const handleClassChange = useCallback(
    () => createFilterHandler("classNameId"),
    [createFilterHandler]
  );

  const handleSubjectChange = useCallback(
    () => createFilterHandler("subjectId"),
    [createFilterHandler]
  );

  const handleCategoryChange = useCallback(
    () => createFilterHandler("categoryId"),
    [createFilterHandler]
  );

  const handleBatchChange = useCallback(
    () => createFilterHandler("batchId"),
    [createFilterHandler]
  );

  const handleSortChange = useCallback(
    () => createFilterHandler("sort"),
    [createFilterHandler]
  );

  const handleLimitChange = useCallback(
    () => createFilterHandler("limit", (v) => parseInt(v, 10)),
    [createFilterHandler]
  );

  const selectedDate = filter.date ? new Date(filter.date) : undefined;

  const handleDateChange = (date: Date | undefined) => {
    setFilter({
      date: date ? date.toISOString() : "",
    });
  };

  const handleClear = useCallback(() => {
    setFilter({
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      batchId: "",
      classNameId: "",
      subjectId: "",
      categoryId: "",
      date: "",
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
          <FilterCalendar
            value={selectedDate}
            onChange={handleDateChange}
            placeholder="Select date"
            showInMobile
            disableFuture={true}
            className="max-w-[180px]"
          />
          <FilterSelect
            value={filter.categoryId}
            onChange={handleCategoryChange}
            placeholder="Category"
            options={categories}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.classNameId}
            onChange={handleClassChange}
            placeholder="Class"
            options={classes}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.batchId}
            onChange={handleBatchChange}
            placeholder="Batch"
            options={batches}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.subjectId}
            onChange={handleSubjectChange}
            placeholder="Subject"
            options={subjects}
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
