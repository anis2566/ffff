import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { StudentsView } from "@/modules/student/ui/view/students-view";
import { getStudents } from "@/modules/student/filters/get-students";

export const metadata: Metadata = {
  title: "Students",
  description: "List of students",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Students = async ({ searchParams }: Props) => {
  const params = await getStudents(searchParams);
  prefetch(trpc.student.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <StudentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Students;
