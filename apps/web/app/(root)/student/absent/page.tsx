import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getAbsentStudents } from "@/modules/student/filters/get-absent-students";
import { AbsentStudentsView } from "@/modules/student/ui/view/absent-student-view";

export const metadata: Metadata = {
  title: "Absent Students",
  description: "List of absent students",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const AbsentStudents = async ({ searchParams }: Props) => {
  const params = await getAbsentStudents(searchParams);
  prefetch(trpc.student.getAbsentMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <AbsentStudentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default AbsentStudents;
