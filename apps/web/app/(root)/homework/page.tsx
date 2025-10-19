import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getHomeworks } from "@/modules/homework/filters/get-homeworks";
import { HomeworksView } from "@/modules/homework/ui/views/homeworks-view";

export const metadata: Metadata = {
  title: "Homeworks",
  description: "List of homeworks",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Homeworks = async ({ searchParams }: Props) => {
  const params = await getHomeworks(searchParams);
  prefetch(trpc.homework.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <HomeworksView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Homeworks;
