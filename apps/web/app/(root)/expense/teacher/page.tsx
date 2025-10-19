import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getPayments } from "@/modules/teacher-payment/filters/get-payments";
import { TeacherPaymentsView } from "@/modules/teacher-payment/ui/views/teacher-payments-view";

export const metadata: Metadata = {
  title: "Teacher Payments",
  description: "List of teacher payment",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const TeacherPayments = async ({ searchParams }: Props) => {
  const params = await getPayments(searchParams);

  prefetch(
    trpc.teacherPayment.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <TeacherPaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default TeacherPayments;
