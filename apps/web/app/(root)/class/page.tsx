import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getClasses } from "@/modules/class/filters/get-classes";
import { ClassesView } from "@/modules/class/ui/view/classes-view";

export const metadata: Metadata = {
  title: "Classes",
  description: "List of classes",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Classes = async ({ searchParams }: Props) => {
  const params = await getClasses(searchParams);
  prefetch(trpc.class.getAll.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <ClassesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Classes;
