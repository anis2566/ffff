import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { EditBatchView } from "@/modules/batch/ui/views/edit-batch-view";

export const metadata: Metadata = {
  title: "Edit Batch",
  description: "Form to edit an existing batch",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditBatch = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.batch.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditBatchView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditBatch;
