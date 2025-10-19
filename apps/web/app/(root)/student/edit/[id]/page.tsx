import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { EditStudentView } from "@/modules/student/ui/view/edit-student-view";

export const metadata: Metadata = {
  title: "Edit Student",
  description: "Form to edit an existing student",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditStudent = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.student.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditStudentView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditStudent;
