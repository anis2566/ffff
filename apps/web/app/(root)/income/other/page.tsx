import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getPayments } from "@/modules/other-payment/filters/get-payments";
import { OtherPaymentsView } from "@/modules/other-payment/ui/views/other-payments-view";

export const metadata: Metadata = {
  title: "Other Payments",
  description: "List of counter",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const OtherPayments = async ({ searchParams }: Props) => {
  const params = await getPayments(searchParams);

  prefetch(
    trpc.otherPayment.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <OtherPaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default OtherPayments;
