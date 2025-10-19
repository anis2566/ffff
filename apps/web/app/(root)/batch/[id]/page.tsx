import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { BatchView } from "@/modules/batch/ui/views/batch-view";

export const metadata: Metadata = {
  title: "Batch Details",
  description: "View details of an existing batch",
};

interface Props {
  params: Promise<{ id: string }>;
}

const Batch = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.batch.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <BatchView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Batch;
