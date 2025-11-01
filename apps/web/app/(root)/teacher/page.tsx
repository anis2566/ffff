import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getTeachers } from "@/modules/teacher/filters/get-teachers";
import { TeachersView } from "@/modules/teacher/ui/view/teachers-view";

export const metadata: Metadata = {
  title: "Teachers",
  description: "List of teachers",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Teachers = async ({ searchParams }: Props) => {
  const params = await getTeachers(searchParams);
  await prefetch(trpc.teacher.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <TeachersView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Teachers;
