"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetAdmissionPayments } from "../../filters/use-get-admission-payment";
import { AdmissionPaymentList } from "../components/admission-payment-list";
import { AdmissionPaymentFilter } from "../components/admission-payment-filter";
import { useCallback } from "react";

export const AdmissionPaymentsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetAdmissionPayments();

  const { data } = useSuspenseQuery(
    trpc.admissionPayment.getMany.queryOptions(filters)
  );

  const { payments = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper title="Manage Payment" value={totalCount}>
      <AdmissionPaymentFilter />
      <AdmissionPaymentList payments={payments} />
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
