import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditExamView } from "@/modules/exam/ui/views/edit-exam-view";

export const metadata: Metadata = {
  title: "Edit Exam",
  description: "Update details of an existing exam",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditExam = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.exam.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditExamView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditExam;
