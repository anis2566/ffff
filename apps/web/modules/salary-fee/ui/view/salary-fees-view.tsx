"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetSalaryFees } from "../../filters/use-get-salary-fees";

import { useCreateSalaryFee } from "@/hooks/use-salary-fee";
import { FeeList } from "../components/fee-list";
import { Filter } from "../components/filter";

export const SalaryFeesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetSalaryFees();
  const { onOpen } = useCreateSalaryFee();

  const { data } = useSuspenseQuery(
    trpc.salaryFee.getMany.queryOptions(filters)
  );

  return (
    <ListCardWrapper
      title="Manage Fee"
      value={data?.totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <FeeList fees={data?.fees || []} />
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
