import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { TeacherView } from "@/modules/teacher/ui/view/teacher-view";

export const metadata: Metadata = {
  title: "Teacher Details",
  description: "View details of an existing teacher",
};

interface Props {
  params: Promise<{ id: string }>;
}

const Teacher = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.teacher.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <TeacherView teacherId={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Teacher;
