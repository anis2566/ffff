"use client";

import { useTRPC } from "@/trpc/react";
import { useQueries } from "@tanstack/react-query";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
} from "@workspace/utils/constant";

import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { FilterCalendar } from "@workspace/ui/shared/filter-calendar";

import { useGetHomeworks } from "../../filters/use-get-homeworks";
import { MobileFilter } from "./mobile-filter";
import { useCallback } from "react";

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

export const Filter = () => {
  const [filter, setFilter] = useGetHomeworks();
  const trpc = useTRPC();

  const [classesQuery, batchesQuery] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.batch.getByClass.queryOptions(filter.classNameId),
    ],
  });

  const classes = (classesQuery.data ?? []).map((v) => ({
    label: v.name,
    value: v.id,
  }));
  const batches = (batchesQuery.data ?? []).map((v) => ({
    label: v.name,
    value: v.id,
  }));

  const hasAnyModified =
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.batchId !== "" ||
    filter.classNameId !== "" ||
    filter.date !== "";

  const handleClassChange = useCallback(
    (value: string) => setFilter({ classNameId: value }),
    [setFilter]
  );

  const handleBatchChange = useCallback(
    (value: string) => setFilter({ batchId: value }),
    [setFilter]
  );

  const handleSortChange = useCallback(
    (value: string) => setFilter({ sort: value }),
    [setFilter]
  );

  const handleLimitChange = useCallback(
    (value: string) => setFilter({ limit: parseInt(value, 10) }),
    [setFilter]
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
      date: "",
    });
  }, [setFilter]);

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterSelect
          value={filter.classNameId}
          onChange={handleClassChange}
          placeholder="Class"
          options={classes}
          className="max-w-[100px]"
        />
        <FilterSelect
          value={filter.batchId}
          onChange={handleBatchChange}
          placeholder="Batch"
          options={batches}
          className="max-w-[100px]"
        />
        <FilterCalendar
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="Select date"
          showInMobile={false}
          disableFuture={true}
          className="max-w-[180px]"
        />
        <FilterSelect
          value={filter.sort}
          onChange={handleSortChange}
          placeholder="Sort"
          options={SORT_OPTIONS}
          className="max-w-[120px]"
        />
        <FilterSelect
          value={""}
          onChange={handleLimitChange}
          placeholder="Limit"
          options={PAGE_SIZE_OPTIONS}
          className="max-w-[120px]"
        />
      </div>
      <div className="flex items-center gap-x-2">
        <ResetFilter hasModified={hasAnyModified} handleReset={handleClear} />
        <MobileFilter classes={classes} batches={batches} />
      </div>
    </div>
  );
};
