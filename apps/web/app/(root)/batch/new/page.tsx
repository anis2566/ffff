import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewBatchView } from "@/modules/batch/ui/views/new-batch-view";

export const metadata: Metadata = {
  title: "New Batch",
  description: "Assign batch to the system",
};

const NewBatch = () => {
  return (
    <ContentLayout>
      <NewBatchView />
    </ContentLayout>
  );
};

export default NewBatch;
