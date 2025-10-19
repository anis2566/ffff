"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/react";

import { ListCardWrapper } from "@workspace/ui/shared/list-card-wrapper";
import { MobilePagination } from "@workspace/ui/shared/mobile-pagination";
import { DesktopPagination } from "@workspace/ui/shared/desktop-pagination";

import { useGetPrintTasks } from "../../filters/use-get-print-tasks";
import { PrintTaskList } from "../components/print-task-list";
import { PrintTaskFilter } from "../components/print-task-filter";

export const PrintTasksView = () => {
  const [filters, setFilters] = useGetPrintTasks();
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.printTask.getMany.queryOptions({ ...filters })
  );

  return (
    <div className="flex-1 flex flex-col gap-6">
      <ListCardWrapper title="Manage Print Tasks" value={data?.totalCount}>
        <PrintTaskFilter />
        <PrintTaskList tasks={data?.tasks} />
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
