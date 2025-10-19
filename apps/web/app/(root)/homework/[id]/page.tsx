import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { HomeworkView } from "@/modules/homework/ui/views/homework-view";

export const metadata: Metadata = {
  title: "Homework Details",
  description: "View details of an existing homework",
};

interface Props {
  params: Promise<{ id: string }>;
}

const Homework = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.homework.getOne.queryOptions({ id }));

  return (
    <ContentLayout>
      <HydrateClient>
        <HomeworkView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Homework;
