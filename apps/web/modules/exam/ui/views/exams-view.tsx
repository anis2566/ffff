"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetExams } from "../../filters/use-get-exams";
import { ExamList } from "../components/exam-list";
import { Filter } from "../components/filter";
import { useCallback } from "react";

export const ExamsView = () => {
  const [filters, setFilters] = useGetExams();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.exam.getMany.queryOptions({
      ...filters,
    })
  );

  const { exams = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Exams" value={totalCount}>
        <Filter />
        <ExamList exams={exams} />
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
