"use client";

import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  DEFAULT_SORT_OPTIONS,
  MONTH,
  TEACHER_PAYMENT_STATUS,
  Session,
} from "@workspace/utils/constant";

import { FilterInput } from "@workspace/ui/shared/filter-input";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";

import { MobileFilter } from "./mobile-filter";
import { useGetPayments } from "../../filters/use-get-payments";

export const Filter = () => {
  const [filter, setFilter] = useGetPayments();

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.session !== "" ||
    filter.id !== "" ||
    filter.month !== "" ||
    filter.status !== "";

  const handleClear = () => {
    setFilter({
      search: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      session: "",
      id: "",
      month: "",
      status: "",
    });
  };

  return (
    <div className="flex-1 flex items-center justify-between gap-x-3">
      <div className="flex-1 flex items-center gap-2">
        <FilterInput
          type="search"
          placeholder="name..."
          value={filter.search}
          onChange={(value: string) => setFilter({ search: value })}
          showInMobile
          className="max-w-[250px]"
        />
        <FilterInput
          type="search"
          placeholder="id..."
          value={filter.id}
          onChange={(value: string) => setFilter({ id: value })}
          showInMobile={false}
          className="max-w-[250px]"
        />
        <FilterSelect
          value={filter.session}
          onChange={(value: string) => setFilter({ session: value })}
          placeholder="Session"
          options={Session}
          className="max-w-[110px]"
        />
        <FilterSelect
          value={filter.month}
          onChange={(value: string) => setFilter({ month: value })}
          placeholder="Month"
          options={Object.values(MONTH).map((v) => ({ label: v, value: v }))}
          className="max-w-[150px]"
        />
        <FilterSelect
          value={filter.status}
          onChange={(value: string) => setFilter({ status: value })}
          placeholder="Status"
          options={Object.values(TEACHER_PAYMENT_STATUS).map((v) => ({
            label: v,
            value: v,
          }))}
          className="max-w-[150px]"
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
