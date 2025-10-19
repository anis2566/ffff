"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetSubjects } from "../../filters/use-get-subjects";

import { useCreateSubject } from "@/hooks/use-subject";
import { SubjectList } from "../components/subject-list";
import { Filter } from "../components/filter";

export const SubjectsView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetSubjects();
  const { onOpen } = useCreateSubject();

  const { data } = useSuspenseQuery(trpc.subject.getMany.queryOptions(filters));

  return (
    <ListCardWrapper
      title="Manage Subject"
      value={data?.totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <SubjectList subjects={data?.subjects || []} />
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
