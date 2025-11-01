"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetOverview } from "../../filters/use-get-overview";
import { PaymentOverviewList } from "../components/payments-overview-list";
import { OverviewFilter } from "../components/overview-filter";
import { useCallback } from "react";

export const SalaryPaymentsOverviewView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetOverview();

  const { data } = useSuspenseQuery(
    trpc.salaryPayment.getOverview.queryOptions(filters)
  );

  const { students = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper title="Manage Payment" value={totalCount}>
      <OverviewFilter />
      <PaymentOverviewList students={students} />
      <DesktopPagination
        totalCount={totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={handlePageChange}
      />
      <MobilePagination
        totalCount={totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={handlePageChange}
      />
    </ListCardWrapper>
  );
};
