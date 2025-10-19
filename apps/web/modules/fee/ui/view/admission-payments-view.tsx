"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetAdmissionPayments } from "../../filters/use-get-admission-payment";
import { AdmissionPaymentList } from "../components/admission-payment-list";
import { AdmissionPaymentFilter } from "../components/admission-payment-filter";

export const AdmissionPaymentsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetAdmissionPayments();

  const { data } = useSuspenseQuery(
    trpc.admissionPayment.getMany.queryOptions(filters)
  );

  return (
    <ListCardWrapper title="Manage Payment" value={data?.totalCount}>
      <AdmissionPaymentFilter />
      <AdmissionPaymentList payments={data?.payments || []} />
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
