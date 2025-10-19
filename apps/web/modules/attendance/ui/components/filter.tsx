"use client";

import { useTRPC } from "@/trpc/react";
import { useQueries } from "@tanstack/react-query";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  MONTH,
  Session,
} from "@workspace/utils/constant";

import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { FilterCalendar } from "@workspace/ui/shared/filter-calendar";

import { useGetStudentAttendances } from "../../filters/use-get-student-attendances";
import { MobileFilter } from "./mobile-filter";

export const Filter = () => {
  const [filter, setFilter] = useGetStudentAttendances();
  const trpc = useTRPC();

  const [classesQuery, batchesQuery] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.batch.getByClass.queryOptions(filter.classNameId),
    ],
  });

  const classes = classesQuery.data;
  const batches = batchesQuery.data;

  const hasAnyModified =
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.session !== "" ||
    filter.month !== "" ||
    filter.batchId !== "" ||
    filter.classNameId !== "" ||
    filter.date !== "";

  const handleClear = () => {
    setFilter({
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      session: "",
      month: "",
      batchId: "",
      classNameId: "",
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
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterSelect
          value={filter.classNameId}
          onChange={(value: string) => setFilter({ classNameId: value })}
          placeholder="Class"
          options={(classes || []).map((v) => ({
            label: v.name,
            value: v.id,
          }))}
          className="max-w-[100px]"
        />
        <FilterSelect
          value={filter.batchId}
          onChange={(value: string) => setFilter({ batchId: value })}
          placeholder="Batch"
          options={(batches || []).map((v) => ({
            label: v.name,
            value: v.id,
          }))}
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
          value={filter.month}
          onChange={(value: string) => setFilter({ month: value })}
          placeholder="Month"
          options={Object.values(MONTH).map((v) => ({
            label: v,
            value: v,
          }))}
          className="max-w-[110px]"
        />
        <FilterSelect
          value={filter.session}
          onChange={(value: string) => setFilter({ session: value })}
          placeholder="Session"
          options={Session}
          className="max-w-[110px]"
        />
        <FilterSelect
          value={filter.sort}
          onChange={(value: string) => setFilter({ sort: value })}
          placeholder="Sort"
          options={Object.values(DEFAULT_SORT_OPTIONS)}
          className="max-w-[100px]"
        />
        <FilterSelect
          value={filter.limit.toString()}
          onChange={(value: string) => setFilter({ limit: parseInt(value) })}
          placeholder="Limit"
          options={Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
            label: v.toString(),
            value: v.toString(),
          }))}
          className="max-w-[100px]"
        />
      </div>
      <div className="flex items-center gap-x-2">
        <ResetFilter hasModified={hasAnyModified} handleReset={handleClear} />
        <MobileFilter batches={batches || []} classes={classes || []} />
      </div>
    </div>
  );
};
