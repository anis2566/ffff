"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useCallback } from "react";

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

  const { fees = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper
      title="Manage Fee"
      value={totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <FeeList fees={fees} />
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
