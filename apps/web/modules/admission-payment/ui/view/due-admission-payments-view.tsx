"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetDueAdmissionPayments } from "../../filters/use-get-due-admission-payment";
import { DueAdmissionPaymentList } from "../components/due-admission-payment-list";
import { DueAdmissionPaymentFilter } from "../components/due-admission-payment-filter";
import { useCallback } from "react";

export const DueAdmissionPaymentsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetDueAdmissionPayments();

  const { data } = useSuspenseQuery(
    trpc.admissionPayment.getDueMany.queryOptions(filters)
  );

  const { payments = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper title="Manage Due Payment" value={totalCount}>
      <DueAdmissionPaymentFilter />
      <DueAdmissionPaymentList payments={payments} />
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
