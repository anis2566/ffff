import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditTeacherView } from "@/modules/teacher/ui/view/edit-teacher-view";

export const metadata: Metadata = {
  title: "Edit Teacher",
  description: "Form to edit an existing teacher",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditTeacher = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.teacher.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditTeacherView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditTeacher;
