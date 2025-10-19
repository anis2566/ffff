"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetAdmissionFees } from "../../filters/use-get-admission-fees";

import { useCreateAdmissionFee } from "@/hooks/use-admission-fee";
import { FeeList } from "../components/fee-list";
import { Filter } from "../components/filter";

export const AdmissionFeesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetAdmissionFees();
  const { onOpen } = useCreateAdmissionFee();

  const { data } = useSuspenseQuery(
    trpc.admissionFee.getMany.queryOptions(filters)
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
