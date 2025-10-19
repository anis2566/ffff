import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getBatches } from "@/modules/batch/filters/get-batches";
import { BatchesBiew } from "@/modules/batch/ui/views/batches-view";

export const metadata: Metadata = {
  title: "Batches",
  description: "List of batches",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Batches = async ({ searchParams }: Props) => {
  const params = await getBatches(searchParams);

  prefetch(
    trpc.batch.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <BatchesBiew />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Batches;
