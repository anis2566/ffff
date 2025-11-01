import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getDueAdmissionPayments } from "@/modules/admission-payment/filters/get-due-admission-payments";
import { DueAdmissionPaymentsView } from "@/modules/admission-payment/ui/view/due-admission-payments-view";

export const metadata: Metadata = {
  title: "Due Admission Payments",
  description: "List of due admission payments",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const DueAdmissionPayments = async ({ searchParams }: Props) => {
  const params = await getDueAdmissionPayments(searchParams);

  prefetch(
    trpc.admissionPayment.getDueMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <DueAdmissionPaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default DueAdmissionPayments;
