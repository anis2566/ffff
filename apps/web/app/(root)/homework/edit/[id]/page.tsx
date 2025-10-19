import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditHomeworkView } from "@/modules/homework/ui/views/edit-homework-view";

export const metadata: Metadata = {
  title: "Edit Homework",
  description: "Edit details of an existing homework",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditHomework = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.homework.getOne.queryOptions({ id }));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditHomeworkView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditHomework;
