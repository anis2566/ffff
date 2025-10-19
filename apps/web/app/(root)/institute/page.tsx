import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { InstitutesView } from "@/modules/institute/ui/view/institutes-view";
import { getInstitutes } from "@/modules/institute/filters/get-institutes";

export const metadata: Metadata = {
  title: "Institutes",
  description: "List of institutes",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Institutes = async ({ searchParams }: Props) => {
  const params = await getInstitutes(searchParams);
  prefetch(trpc.institute.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <InstitutesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Institutes;
