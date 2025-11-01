import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getCategories } from "@/modules/exam-category/filters/get-categories";
import { CategoriesView } from "@/modules/exam-category/ui/view/categories-view";

export const metadata: Metadata = {
  title: "Exam Categories",
  description: "List of Exam Categories",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const ExamCategories = async ({ searchParams }: Props) => {
  const params = await getCategories(searchParams);
  await prefetch(trpc.examCategory.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <CategoriesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default ExamCategories;
