"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetDuePayments } from "../../filters/use-get-due-payments";
import { DuePaymentList } from "../components/due-payment-list";
import { DueFilter } from "../components/due-filter";

export const DueSalaryPaymentsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetDuePayments();

  const { data } = useSuspenseQuery(
    trpc.salaryPayment.getDueMany.queryOptions(filters)
  );

  return (
    <ListCardWrapper title="Manage Payment" value={data?.totalCount}>
      <DueFilter />
      <DuePaymentList payments={data?.payments || []} />
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
