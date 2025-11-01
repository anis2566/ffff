"use client";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  LEVELS,
  Session,
} from "@workspace/utils/constant";

import { FilterInput } from "@workspace/ui/shared/filter-input";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { useGetClasses } from "../../filters/use-get-classes";
import { MobileFilter } from "./mobile-filter";
import { useCallback } from "react";

// Pre-compute static options outside component
const LEVEL_OPTIONS = Object.values(LEVELS).map((v) => ({
  label: v,
  value: v,
}));
const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

export const Filter = () => {
  const [filter, setFilter] = useGetClasses();

  // Memoize the hasAnyModified check
  const hasAnyModified =
    !!filter.search ||
    filter.limit !== DEFAULT_PAGE_SIZE ||
    filter.page !== DEFAULT_PAGE ||
    !!filter.sort ||
    !!filter.level ||
    !!filter.session;

  // Memoize handlers
  const handleClear = useCallback(() => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      level: "",
      session: "",
    });
  }, [setFilter]);

  const handleSearchChange = useCallback(
    (value: string) => setFilter({ search: value }),
    [setFilter]
  );

  const handleLevelChange = useCallback(
    (value: string) => setFilter({ level: value }),
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
          placeholder="search..."
          value={filter.search}
          onChange={handleSearchChange}
          showInMobile
          className="max-w-sm"
        />
        <FilterSelect
          value={filter.level}
          onChange={handleLevelChange}
          placeholder="Level"
          options={LEVEL_OPTIONS}
          className="max-w-[120px]"
        />
        <FilterSelect
          value={filter.session}
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
          options={PAGE_SIZE_OPTIONS}
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
