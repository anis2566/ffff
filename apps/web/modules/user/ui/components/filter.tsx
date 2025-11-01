"use client";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
} from "@workspace/utils/constant";

import { FilterInput } from "@workspace/ui/shared/filter-input";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { useGetUsers } from "../../filters/use-get-users";
import { MobileFilter } from "./mobile-filter";
import { useCallback } from "react";

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

export const Filter = () => {
  const [filter, setFilter] = useGetUsers();

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.email !== "";

  const handleSearchChange = useCallback(
    (value: string) => setFilter({ search: value }),
    [setFilter]
  );

  const handleEmailChange = useCallback(
    (value: string) => setFilter({ email: value }),
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

  const handleClear = useCallback(() => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      email: "",
    });
  }, [setFilter]);

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterInput
          type="search"
          placeholder="search by name..."
          value={filter.search}
          onChange={handleSearchChange}
          showInMobile
          className="max-w-sm"
        />
        <FilterInput
          type="search"
          placeholder="search by email..."
          value={filter.email}
          onChange={handleEmailChange}
          showInMobile
          className="max-w-sm"
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
