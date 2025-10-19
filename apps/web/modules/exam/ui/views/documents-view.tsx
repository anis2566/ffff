"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetDocuments } from "../../filters/use-get-documents";
import { DocumentList } from "../components/document-list";
import { DocumentFilter } from "../components/document-filter";

export const DocumentsView = () => {
  const [filters, setFilters] = useGetDocuments();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.document.getMany.queryOptions({ ...filters })
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Documents" value={data?.totalCount}>
        <DocumentFilter />
        <DocumentList documents={data?.documents} />
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
