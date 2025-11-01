"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetPayments } from "../../filters/use-get-payments";
import { Filter } from "../components/filter";
import { PaymentList } from "../components/payment-list";
import { useCreateIncome } from "@/hooks/use-other-income";
import { useCallback } from "react";

export const OtherPaymentsView = () => {
  const [filters, setFilters] = useGetPayments();
  const trpc = useTRPC();
  const { onOpen } = useCreateIncome();

  const { data } = useSuspenseQuery(
    trpc.otherPayment.getMany.queryOptions({
      ...filters,
    })
  );

  const { payments = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper
        title="Manage Payments"
        value={totalCount}
        actionButtons
        onClickAction={onOpen}
      >
        <Filter />
        <PaymentList payments={payments} />
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
    </div>
  );
};
