"use client";

import { Filter } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@workspace/ui/components/drawer";
import { FilterSelect } from "@workspace/ui/shared/filter-select";
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
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Separator } from "@workspace/ui/components/separator";
import { FilterInput } from "@workspace/ui/shared/filter-input";

import { useGetOverview } from "../../filters/use-get-overview";

interface MobileFilterProps {
  classes: {
    name: string;
  }[];
}

const PAGE_SIZE_OPTIONS = Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
  label: v.toString(),
  value: v.toString(),
}));
const SORT_OPTIONS = Object.values(DEFAULT_SORT_OPTIONS);
const MONTH_OPTIONS = Object.values(MONTH).map((v) => ({
  label: v,
  value: v,
}));
const STATUS_OPTIONS = Object.values(SALARY_STATUS)
  .map((v) => ({
    label: v,
    value: v,
  }))
  .slice(2, 4);
const PAYMENT_STATUS_OPTIONS = Object.values(SALARY_PAYMENT_STATUS)
  .map((v) => ({
    label: v,
    value: v,
  }))
  .slice(1, 3);
export const MobileFilter = ({ classes }: MobileFilterProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useGetOverview();

  const classNameOptions = classes.map((v) => ({
    label: v.name,
    value: v.name,
  }));

  const createFilterHandler = useCallback(
    (key: string, transform?: (value: string) => any) => (value: string) => {
      try {
        setFilter({ [key]: transform ? transform(value) : value });
      } catch (error) {
        console.error(`Error setting ${key}:`, error);
      } finally {
        setOpen(false);
      }
    },
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

  const handleIdChange = useCallback(
    (value: string) => setFilter({ id: value }),
    [setFilter]
  );

  const handleClassNameChange = useCallback(
    (value: string) => setFilter({ className: value }),
    [setFilter]
  );

  const handleMonthChange = useCallback(
    (value: string) => setFilter({ month: value }),
    [setFilter]
  );

  const handleSortChange = useCallback(
    () => createFilterHandler("sort"),
    [createFilterHandler]
  );

  const handleLimitChange = useCallback(
    () => createFilterHandler("limit", (v) => parseInt(v, 10)),
    [createFilterHandler]
  );

  const handleSessionChange = useCallback(
    () => createFilterHandler("session"),
    [createFilterHandler]
  );

  const hasAnyModified =
    !!filter.search ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.session !== "" ||
    filter.className !== "" ||
    filter.id !== "" ||
    filter.status !== "" ||
    filter.month !== "" ||
    filter.paymentStatus !== "";

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
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" className="rounded-xs md:hidden">
          <Filter />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-4">
        <DrawerHeader>
          <DrawerTitle />
        </DrawerHeader>
        <div className="flex items-center justify-between">
          <ResetFilter hasModified={hasAnyModified} handleReset={handleClear} />
          <DrawerClose asChild>
            <Button variant="outline" size="sm" className="ml-auto">
              Close
            </Button>
          </DrawerClose>
        </div>
        <Separator className="my-4" />
        <div className="flex flex-col gap-4">
          <FilterInput
            type="search"
            placeholder="id..."
            value={filter.id}
            onChange={handleIdChange}
            showInMobile
            className="max-w-full rounded-md"
          />
          <FilterSelect
            value={filter.status}
            onChange={handleStatusChange}
            placeholder="Status"
            options={STATUS_OPTIONS}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.paymentStatus}
            onChange={handlePaymentStatusChange}
            placeholder="P. Status"
            options={PAYMENT_STATUS_OPTIONS}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.month}
            onChange={handleMonthChange}
            placeholder="Month"
            options={MONTH_OPTIONS}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.session}
            onChange={handleSessionChange}
            placeholder="Session"
            options={Session}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.className}
            onChange={handleClassNameChange}
            placeholder="Class"
            options={classNameOptions}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.sort}
            onChange={handleSortChange}
            placeholder="Sort"
            options={SORT_OPTIONS}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={""}
            onChange={handleLimitChange}
            placeholder="Limit"
            options={PAGE_SIZE_OPTIONS}
            className="max-w-full"
            showInMobile
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
