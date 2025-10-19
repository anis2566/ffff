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

export const Filter = () => {
  const [filter, setFilter] = useGetUsers();

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.email !== "";

  const handleClear = () => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      email: "",
    });
  };

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterInput
          type="search"
          placeholder="search by name..."
          value={filter.search}
          onChange={(value: string) => setFilter({ search: value })}
          showInMobile
          className="max-w-sm"
        />
        <FilterInput
          type="search"
          placeholder="search by email..."
          value={filter.email}
          onChange={(value: string) => setFilter({ email: value })}
          showInMobile
          className="max-w-sm"
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
