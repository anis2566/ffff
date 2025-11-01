import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditExamResultView } from "@/modules/exam-result/ui/views/edit-exam-result-view";

export const metadata: Metadata = {
  title: "Edit Exam Result",
  description: "Edit an existing exam result",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditExamResult = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.examResult.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditExamResultView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditExamResult;
