import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getSubjects } from "@/modules/subject/filters/get-subjects";
import { SubjectsView } from "@/modules/subject/ui/view/subjects-view";

export const metadata: Metadata = {
  title: "Subjects",
  description: "List of subject",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Subjects = async ({ searchParams }: Props) => {
  const params = await getSubjects(searchParams);
  prefetch(trpc.subject.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <SubjectsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Subjects;
