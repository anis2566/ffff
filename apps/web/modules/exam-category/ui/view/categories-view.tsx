"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetCategories } from "../../filters/use-get-categories";

import { useCreateCategory } from "@/hooks/use-category";
import { CategoryList } from "../components/category-list";

export const CategoriesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetCategories();
  const { onOpen } = useCreateCategory();

  const { data } = useSuspenseQuery(
    trpc.examCategory.getMany.queryOptions(filters)
  );

  return (
    <ListCardWrapper
      title="Manage Categories"
      value={data?.totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <CategoryList categories={data?.categories || []} />
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
