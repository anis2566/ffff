"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetPayments } from "../../filters/use-get-payments";
import { PaymentList } from "../components/payment-list";
import { Filter } from "../components/filter";

export const SalaryPaymentsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetPayments();

  const { data } = useSuspenseQuery(
    trpc.salaryPayment.getMany.queryOptions(filters)
  );

  return (
    <ListCardWrapper title="Manage Payment" value={data?.totalCount}>
      <Filter />
      <PaymentList payments={data?.payments || []} />
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
