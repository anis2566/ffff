import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { StudentView } from "@/modules/student/ui/view/student-view";

export const metadata: Metadata = {
  title: "Student Details",
  description: "Details of student",
};

interface Props {
  params: Promise<{ id: string }>;
}

const Student = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.student.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <StudentView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Student;
