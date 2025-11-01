"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetExamResults } from "../../filters/use-get-exam-results";
import { ResultList } from "../components/result-list";
import { useCallback } from "react";
import { Filter } from "../components/filter";

export const ExamResultsView = () => {
  const [filters, setFilters] = useGetExamResults();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.examResult.getMany.queryOptions({
      ...filters,
    })
  );

  const { results = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Result" value={totalCount}>
        <Filter />
        <ResultList results={results} />
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
