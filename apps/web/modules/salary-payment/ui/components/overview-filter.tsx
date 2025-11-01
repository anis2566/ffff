"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  MONTH,
  SALARY_PAYMENT_STATUS,
  SALARY_STATUS,
  Session,
} from "@workspace/utils/constant";

import { FilterInput } from "@workspace/ui/shared/filter-input";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { MobileFilter } from "./mobile-filter";
import { useCallback } from "react";
import { useGetOverview } from "../../filters/use-get-overview";

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);
const MONTH_OPTIONS = Object.values(MONTH).map((v) => ({
  label: v,
  value: v,
}));
const STATUS_OPTIONS = Object.values(SALARY_STATUS).map((v) => ({
  label: v,
  value: v,
})).slice(2, 4);
const PAYMENT_STATUS_OPTIONS = Object.values(SALARY_PAYMENT_STATUS).map(
  (v) => ({
    label: v,
    value: v,
  })
).slice(1, 3);

export const OverviewFilter = () => {
  const [filter, setFilter] = useGetOverview();
  const trpc = useTRPC();

  const { data: classes } = useQuery(
    trpc.class.forSelect.queryOptions({ search: "" })
  );

  const classNameOptions = (classes ?? []).map((v) => ({
    label: v.name,
    value: v.id,
  }));

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.session !== "" ||
    filter.className !== "" ||
    filter.id !== "" ||
    filter.month !== "" ||
    filter.status !== "" ||
    filter.paymentStatus !== "";

  const handleSearchChange = useCallback(
    (value: string) => setFilter({ search: value }),
    [setFilter]
  );

  const handleClassNameChange = useCallback(
    (value: string) => setFilter({ className: value }),
    [setFilter]
  );

  const handleIdChange = useCallback(
    (value: string) => setFilter({ id: value }),
    [setFilter]
  );

  const handleMonthChange = useCallback(
    (value: string) => setFilter({ month: value }),
    [setFilter]
  );

  const handleStatusChange = useCallback(
    (value: string) => setFilter({ status: value }),
    [setFilter]
  );

  const handlePaymentStatusChange = useCallback(
    (value: string) => setFilter({ paymentStatus: value }),
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

  const handleClear = useCallback(() => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      session: "",
      className: "",
      id: "",
      month: "",
      status: "",
      paymentStatus: "",
    });
  }, [setFilter]);

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterInput
          type="search"
          placeholder="name..."
          value={filter.search}
          onChange={handleSearchChange}
          showInMobile
          className="max-w-full md:max-w-[250px]"
        />
        <FilterInput
          type="search"
          placeholder="id..."
          value={filter.id}
          onChange={handleIdChange}
          showInMobile={false}
          className="max-w-[250px]"
        />
        <FilterSelect
          value={filter.status}
          onChange={handleStatusChange}
          placeholder="Status"
          options={STATUS_OPTIONS}
          className="max-w-[120px]"
        />
        <FilterSelect
          value={filter.paymentStatus}
          onChange={handlePaymentStatusChange}
          placeholder="P. Status"
          options={PAYMENT_STATUS_OPTIONS}
          className="max-w-[120px]"
        />
        <FilterSelect
          value={filter.className}
          onChange={handleClassNameChange}
          placeholder="Class"
          options={classNameOptions}
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
          value={filter.month}
          onChange={handleMonthChange}
          placeholder="Month"
          options={MONTH_OPTIONS}
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
        <MobileFilter classes={classes || []} />
      </div>
    </div>
  );
};
