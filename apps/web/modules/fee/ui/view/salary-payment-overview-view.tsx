"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetOverview } from "../../filters/use-get-overview";
import { PaymentOverviewList } from "../components/payments-overview-list";
import { OverviewFilter } from "../components/overview-filter";

export const SalaryPaymentsOverviewView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetOverview();

  const { data } = useSuspenseQuery(
    trpc.salaryPayment.getOverview.queryOptions(filters)
  );

  return (
    <ListCardWrapper title="Manage Payment" value={data?.totalCount}>
      <OverviewFilter />
      <PaymentOverviewList students={data?.students || []} />
      <DesktopPagination
        totalCount={data?.totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={(page) => setFilters({ page })}
      />
      <MobilePagination
        totalCount={data?.totalCount}
        currentPage={filters.page}
        pageSize={filters.limit}
        onPageChange={(page) => setFilters({ page })}
      />
    </ListCardWrapper>
  );
};
