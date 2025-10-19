"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetPayments } from "../../filters/use-get-payments";
import { PaymentsList } from "../components/payment-list";
import { Filter } from "../components/filter";

export const TeacherPaymentsView = () => {
  const [filters, setFilters] = useGetPayments();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.teacherPayment.getMany.queryOptions({
      ...filters,
    })
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Payment" value={data?.totalCount}>
        <Filter />
        <PaymentsList payments={data?.payments} />
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
