import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getAdmissionPayments } from "@/modules/fee/filters/get-admission-payments";
import { AdmissionPaymentsView } from "@/modules/fee/ui/view/admission-payments-view";

export const metadata: Metadata = {
  title: "Admission Payments",
  description: "List of admission payments",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const AdmissionPayments = async ({ searchParams }: Props) => {
  const params = await getAdmissionPayments(searchParams);

  prefetch(
    trpc.admissionPayment.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <AdmissionPaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default AdmissionPayments;
