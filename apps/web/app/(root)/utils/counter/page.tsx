import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { CountersView } from "@/modules/counter/ui/view/counters-view";
import { getCounters } from "@/modules/counter/filters/get-counters";

export const metadata: Metadata = {
  title: "Counters",
  description: "List of couters",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Couters = async ({ searchParams }: Props) => {
  const params = await getCounters(searchParams);
  await prefetch(trpc.counter.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <CountersView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Couters;
