"use client";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  Session,
} from "@workspace/utils/constant";

import { FilterInput } from "@workspace/ui/shared/filter-input";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { useCallback } from "react";
import { useGetBatches } from "../../filters/use-get-batches";
import { useTRPC } from "@/trpc/react"; 
import { useQueries } from "@tanstack/react-query";
import { MobileFilter } from "./mobile-filter";

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);

export const Filter = () => {
  const [filter, setFilter] = useGetBatches();
  const trpc = useTRPC();

  const [classesQuery, roomsQuery] = useQueries({
    queries: [
      trpc.class.forSelect.queryOptions({ search: "" }),
      trpc.room.forSelect.queryOptions({ query: "" }),
    ],
  });

  const classes = (classesQuery.data ?? []).map((v) => ({
    label: v.name,
    value: v.id,
  }));
  const rooms = (roomsQuery.data ?? []).map((v) => ({
    label: v.name,
    value: v.id,
  }));

  // Memoize the hasAnyModified check
  const hasAnyModified =
    filter.limit !== DEFAULT_PAGE_SIZE ||
    filter.page !== DEFAULT_PAGE ||
    !!filter.sort ||
    !!filter.search ||
    !!filter.session ||
    !!filter.className ||
    !!filter.room;

  const handleSearchChange = useCallback(
    (value: string) => setFilter({ search: value }),
    [setFilter]
  );

  const handleClassNameChange = useCallback(
    (value: string) => setFilter({ className: value }),
    [setFilter]
  );

  const handleRoomChange = useCallback(
    (value: string) => setFilter({ room: value }),
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

  // Memoize handlers
  const handleClear = useCallback(() => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      className: "",
      room: "",
      session: "",
    });
  }, [setFilter]);

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
          value={filter.className}
          onChange={handleClassNameChange}
          placeholder="Class"
          options={classes}
          className="max-w-[120px]"
        />
        <FilterSelect
          value={filter.room}
          onChange={handleRoomChange}
          placeholder="Room"
          options={rooms}
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
        <MobileFilter classes={classes} rooms={rooms} />
      </div>
    </div>
  );
};
