import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getPrintTasks } from "@/modules/task/filters/get-print-tasks";
import { PrintTasksView } from "@/modules/task/ui/views/print-tasks-view";

export const metadata: Metadata = {
  title: "Print Tasks",
  description: "List of print tasks",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const PrintTasks = async ({ searchParams }: Props) => {
  const params = await getPrintTasks(searchParams);
  prefetch(trpc.printTask.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <PrintTasksView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default PrintTasks;
