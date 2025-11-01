"use client";

import { useCallback } from "react";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  INSTITUTE_TYPES,
  Session,
} from "@workspace/utils/constant";

import { FilterInput } from "@workspace/ui/shared/filter-input";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { MobileFilter } from "./mobile-filter";
import { useGetInstitutes } from "../../filters/use-get-institutes";

// Memoize options outside component to prevent recreation
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

export const Filter = () => {
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

  const handleSearchChange = useCallback(
    (value: string) => setFilter({ search: value }),
    [setFilter]
  );

  const handleTypeChange = useCallback(
    (value: string) => setFilter({ type: value }),
    [setFilter]
  );

  const handleSessionChange = useCallback(
    (value: string) => setFilter({ session: value }),
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

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterInput
          type="search"
          placeholder="Search..."
          value={filter.search}
          onChange={handleSearchChange}
          showInMobile
          className="max-w-sm"
        />
        <FilterSelect
          value={filter.type}
          onChange={handleTypeChange}
          placeholder="Type"
          options={TYPE_OPTIONS}
          className="max-w-[120px]"
        />
        <FilterSelect
          value={""}
          onChange={handleSessionChange}
          placeholder="Session"
          options={Session}
          className="max-w-[120px]"
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
          options={LIMIT_OPTIONS}
          className="max-w-[120px]"
        />
      </div>
      <div className="flex items-center gap-x-2">
        <ResetFilter hasModified={hasAnyModified} handleReset={handleClear} />
        <MobileFilter />
      </div>
    </div>
  );
};
