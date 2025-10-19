import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getExams } from "@/modules/exam/filters/get-exams";
import { ExamsView } from "@/modules/exam/ui/views/exams-view";

export const metadata: Metadata = {
  title: "Exams",
  description: "List of exams",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Exams = async ({ searchParams }: Props) => {
  const params = await getExams(searchParams);
  prefetch(trpc.exam.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <ExamsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Exams;
