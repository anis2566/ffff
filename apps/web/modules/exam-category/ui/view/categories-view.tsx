"use client";

import { useTRPC } from "@/trpc/react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";

import { useGetCategories } from "../../filters/use-get-categories";

import { useCreateCategory } from "@/hooks/use-category";
import { CategoryList } from "../components/category-list";
import { useCallback } from "react";
import { Filter } from "../components/filter";

export const CategoriesView = () => {
  const trpc = useTRPC();
  const [filters, setFilters] = useGetCategories();
  const { onOpen } = useCreateCategory();

  const { data } = useSuspenseQuery(
    trpc.examCategory.getMany.queryOptions(filters)
  );

  const { categories = [], totalCount = 0 } = data;

  const handlePageChange = useCallback(
    (page: number) => setFilters({ page }),
    [setFilters]
  );

  return (
    <ListCardWrapper
      title="Manage Categories"
      value={totalCount}
      actionButtons
      onClickAction={onOpen}
    >
      <Filter />
      <CategoryList categories={categories} />
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
