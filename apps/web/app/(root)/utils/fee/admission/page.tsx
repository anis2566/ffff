import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getAdmissionFees } from "@/modules/admission-fee/filters/get-admission-fees";
import { AdmissionFeesView } from "@/modules/admission-fee/ui/view/admission-fees-view";

export const metadata: Metadata = {
  title: "Admission Fees",
  description: "List of admission fees",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const AdmissionFees = async ({ searchParams }: Props) => {
  const params = await getAdmissionFees(searchParams);

  await prefetch(trpc.admissionFee.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <AdmissionFeesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default AdmissionFees;
