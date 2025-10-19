"use client";

import { Filter } from "lucide-react";
import { useState } from "react";

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
import { Batch, ClassName, ExamCategory, Subject } from "@workspace/db";
import { FilterCalendar } from "@workspace/ui/shared/filter-calendar";

import { useGetExams } from "../../filters/use-get-exams";

interface MobileFilterProps {
  classes: ClassName[];
  batches: Batch[];
  subjects: Subject[];
  categories: ExamCategory[];
}

export const MobileFilter = ({
  classes,
  batches,
  subjects,
  categories,
}: MobileFilterProps) => {
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useGetExams();

  const handleSortChange = (value: string) => {
    try {
      setFilter({ sort: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleLimitChange = (value: string) => {
    try {
      setFilter({ limit: parseInt(value) });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleSubjectChange = (value: string) => {
    try {
      setFilter({ subjectId: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    try {
      setFilter({ categoryId: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleClassChange = (value: string) => {
    try {
      setFilter({ classNameId: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleBatchChange = (value: string) => {
    try {
      setFilter({ batchId: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const hasAnyModified =
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.batchId !== "" ||
    filter.classNameId !== "" ||
    filter.subjectId !== "" ||
    filter.categoryId !== "" ||
    filter.date !== "";

  const handleClear = () => {
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
  };

  const selectedDate = filter.date ? new Date(filter.date) : undefined;

  const handleDateChange = (date: Date | undefined) => {
    setFilter({
      date: date ? date.toISOString() : "",
    });
  };

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
            options={categories.map((v) => ({
              label: v.name,
              value: v.name,
            }))}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.classNameId}
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
            value={filter.batchId}
            onChange={handleBatchChange}
            placeholder="Batch"
            options={batches.map((v) => ({
              label: v.name,
              value: v.name,
            }))}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.subjectId}
            onChange={handleSubjectChange}
            placeholder="Subject"
            options={subjects.map((v) => ({
              label: v.name,
              value: v.name,
            }))}
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
