import { SearchParams } from "nuqs";
import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { TeacherAdvancesView } from "@/modules/teacher-advance/ui/view/advances-view";
import { getAdvances } from "@/modules/teacher-advance/filters/get-advances";

export const metadata: Metadata = {
  title: "Advances",
  description: "List of teachers advance",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Advances = async ({ searchParams }: Props) => {
  const params = await getAdvances(searchParams);

  prefetch(
    trpc.teacherAdvance.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <TeacherAdvancesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Advances;
