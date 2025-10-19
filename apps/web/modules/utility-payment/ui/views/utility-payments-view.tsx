"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetPayments } from "../../filters/use-get-payments";
import { Filter } from "../components/filter";
import { PaymentList } from "../components/payment-list";

export const UtilityPaymentsView = () => {
  const [filters, setFilters] = useGetPayments();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.utilityPayment.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Payments" value={data?.totalCount}>
        <Filter />
        <PaymentList payments={data?.payments} />
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
    </div>
  );
};
