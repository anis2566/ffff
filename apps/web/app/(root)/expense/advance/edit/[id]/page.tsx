import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { EditAdvanceView } from "@/modules/teacher-advance/ui/view/edit-advance-view";

export const metadata: Metadata = {
  title: "Edit Advance",
  description: "Form to edit an existing advance",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditAdvance = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.teacherAdvance.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditAdvanceView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditAdvance;
