import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getExamResults } from "@/modules/exam/filters/get-exam-results";
import { ExamResultsView } from "@/modules/exam/ui/views/exam-results-view";

export const metadata: Metadata = {
  title: "Exam Results",
  description: "List of exam results",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const ExamResults = async ({ searchParams }: Props) => {
  const params = await getExamResults(searchParams);
  prefetch(trpc.examResult.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <ExamResultsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default ExamResults;
