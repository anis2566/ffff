"use client";

import { useTRPC } from "@/trpc/react";
import { useQueries } from "@tanstack/react-query";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  DOCUMENT_TYPE,
} from "@workspace/utils/constant";

import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { FilterCalendar } from "@workspace/ui/shared/filter-calendar";

import { useGetDocuments } from "../../filters/use-get-documents";
import { MobileDocumentFilter } from "./mobile-document-filter";

export const DocumentFilter = () => {
  const [filter, setFilter] = useGetDocuments();
  const trpc = useTRPC();

  const [classesQuery, subjectsQuery] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.subject.getByClass.queryOptions(filter.classNameId),
    ],
  });

  const classes = classesQuery.data;
  const subjects = subjectsQuery.data;

  const hasAnyModified =
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.classNameId !== "" ||
    filter.subjectId !== "" ||
    filter.date !== "" ||
    filter.type !== "" ||
    filter.hasReceived !== "" ||
    filter.hasFinished !== "" ||
    filter.hasPrinted !== "";

  const handleClear = () => {
    setFilter({
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      classNameId: "",
      subjectId: "",
      date: "",
      type: "",
      hasReceived: "",
      hasFinished: "",
      hasPrinted: "",
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
        <FilterCalendar
          value={selectedDate}
          onChange={handleDateChange}
          placeholder="Select date"
          showInMobile={false}
          className="max-w-[180px]"
        />
        <FilterSelect
          value={filter.type}
          onChange={(value: string) => setFilter({ type: value })}
          placeholder="Type"
          options={Object.values(DOCUMENT_TYPE).map((v) => ({
            label: v,
            value: v,
          }))}
          className="max-w-[100px]"
        />
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
          value={filter.subjectId}
          onChange={(value: string) => setFilter({ subjectId: value })}
          placeholder="Subject"
          options={(subjects || []).map((v) => ({
            label: v.name,
            value: v.id,
          }))}
          className="max-w-[100px]"
        />
        <FilterSelect
          value={filter.hasReceived}
          onChange={(value: string) => setFilter({ hasReceived: value })}
          placeholder="Received"
          options={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ].map((v) => ({
            label: v.label,
            value: v.value,
          }))}
          className="max-w-[100px]"
        />
        <FilterSelect
          value={filter.hasFinished}
          onChange={(value: string) => setFilter({ hasFinished: value })}
          placeholder="Finished"
          options={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ].map((v) => ({
            label: v.label,
            value: v.value,
          }))}
          className="max-w-[100px]"
        />
        <FilterSelect
          value={filter.hasPrinted}
          onChange={(value: string) => setFilter({ hasPrinted: value })}
          placeholder="Printed"
          options={[
            { label: "Yes", value: "true" },
            { label: "No", value: "false" },
          ].map((v) => ({
            label: v.label,
            value: v.value,
          }))}
          className="max-w-[100px]"
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
        <MobileDocumentFilter
          classes={classes ?? []}
          subjects={subjects ?? []}
        />
      </div>
    </div>
  );
};
