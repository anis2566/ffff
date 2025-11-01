import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { ExamResultsView } from "@/modules/exam-result/ui/views/exam-results-view";
import { getExamResults } from "@/modules/exam-result/filters/get-exam-results";

export const metadata: Metadata = {
  title: "Exam Results",
  description: "List of exam results",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const ExamResults = async ({ searchParams }: Props) => {
  const params = await getExamResults(searchParams);
  await prefetch(trpc.examResult.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <ExamResultsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default ExamResults;
