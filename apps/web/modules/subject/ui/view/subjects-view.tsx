"use client";

import { useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/react";
import { useGetSubjects } from "../../filters/use-get-subjects";
import { useCreateSubject } from "@/hooks/use-subject";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { SubjectList } from "../components/subject-list";
import { Filter } from "../components/filter";

export const SubjectsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetSubjects();
  const { onOpen } = useCreateSubject();

  const { data } = useSuspenseQuery(trpc.subject.getMany.queryOptions(filters));

  const { subjects = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper
      title="Manage Subject"
      value={data?.totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <SubjectList subjects={subjects} />
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
