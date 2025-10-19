"use client";

import { Filter } from "lucide-react";
import { useState } from "react";

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
  GROUPS,
} from "@workspace/utils/constant";
import { ResetFilter } from "@workspace/ui/shared/reset-filter";
import { Separator } from "@workspace/ui/components/separator";
import { ClassName } from "@workspace/db";

import { useGetSalaryFees } from "../../filters/use-get-salary-fees";

interface MobileFilterProps {
  classes: ClassName[];
}

export const MobileFilter = ({ classes }: MobileFilterProps) => {
  const [open, setOpen] = useState(false);

  const [filter, setFilter] = useGetSalaryFees();

  const handleSortChange = (value: string) => {
    try {
      setFilter({ sort: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleLimitChange = (value: string) => {
    try {
      setFilter({ limit: parseInt(value) });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleGroupChange = (value: string) => {
    try {
      setFilter({ group: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const handleClassChange = (value: string) => {
    try {
      setFilter({ className: value });
    } catch (error) {
      console.error(error);
    } finally {
      setOpen(false);
    }
  };

  const hasAnyModified =
    !!filter.className ||
    filter.limit !== 5 ||
    filter.page !== 1 ||
    filter.sort !== "" ||
    filter.group !== "";

  const handleClear = () => {
    setFilter({
      className: "",
      limit: DEFAULT_PAGE_SIZE,
      page: DEFAULT_PAGE,
      sort: "",
      group: "",
    });
  };

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
          <FilterSelect
            value={filter.className}
            onChange={(value: string) => handleClassChange(value)}
            placeholder="Class"
            options={(classes || []).map((v) => ({
              label: v.name,
              value: v.name,
            }))}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.group}
            onChange={(value: string) => handleGroupChange(value)}
            placeholder="Group"
            options={Object.values(GROUPS).map((v) => ({ label: v, value: v }))}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.sort}
            onChange={handleSortChange}
            placeholder="Sort"
            options={Object.values(DEFAULT_SORT_OPTIONS)}
            className="max-w-full"
            showInMobile
          />
          <FilterSelect
            value={filter.limit.toString()}
            onChange={handleLimitChange}
            placeholder="Limit"
            options={Object.values(DEFAULT_PAGE_SIZE_OPTIONS).map((v) => ({
              label: v.toString(),
              value: v.toString(),
            }))}
            className="max-w-full"
            showInMobile
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
