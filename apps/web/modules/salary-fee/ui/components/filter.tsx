"use client";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  GROUPS,
  Session,
} from "@workspace/utils/constant";

import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { useMemo, useCallback } from "react";
import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useGetSalaryFees } from "../../filters/use-get-salary-fees";
import { MobileFilter } from "./mobile-filter";

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);
const GROUP_OPTIONS = Object.values(GROUPS).map((v) => ({
  label: v,
  value: v,
}));

export const Filter = () => {
  const [filter, setFilter] = useGetSalaryFees();
  const trpc = useTRPC();

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  // Memoize the hasAnyModified check
  const hasAnyModified =
    !!filter.className ||
    filter.limit !== DEFAULT_PAGE_SIZE ||
    filter.page !== DEFAULT_PAGE ||
    !!filter.sort ||
    !!filter.session ||
    !!filter.group;

  // Memoize handlers
  const handleClear = useCallback(() => {
    setFilter({
      className: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      session: "",
      group: "",
    });
  }, [setFilter]);

  const handleClassNameChange = useCallback(
    (value: string) => setFilter({ className: value }),
    [setFilter]
  );

  const handleGroupChange = useCallback(
    (value: string) => setFilter({ group: value }),
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
        <FilterSelect
          value={filter.className}
          onChange={handleClassNameChange}
          placeholder="Class"
          options={(classes || []).map((c) => ({
            label: c.name,
            value: c.name,
          }))}
          className="max-w-[120px]"
        />
        <FilterSelect
          value={filter.group}
          onChange={handleGroupChange}
          placeholder="Group"
          options={GROUP_OPTIONS}
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
        <MobileFilter classes={classes ?? []} />
      </div>
    </div>
  );
};
