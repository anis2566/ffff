"use client";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  INSTITUTE_TYPES,
} from "@workspace/utils/constant";

import { FilterInput } from "@workspace/ui/shared/filter-input";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { MobileFilter } from "./mobile-filter";
import { useGetInstitutes } from "../../filters/use-get-institutes";

export const Filter = () => {
  const [filter, setFilter] = useGetInstitutes();

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.type !== "";

  const handleClear = () => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      type: "",
    });
  };

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterInput
          type="search"
          placeholder="search..."
          value={filter.search}
          onChange={(value: string) => setFilter({ search: value })}
          showInMobile
          className="max-w-sm"
        />
        <FilterSelect
          value={filter.type}
          onChange={(value: string) => setFilter({ type: value })}
          placeholder="Type"
          options={Object.values(INSTITUTE_TYPES).map((v) => ({
            label: v,
            value: v,
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
        <MobileFilter />
      </div>
    </div>
  );
};
