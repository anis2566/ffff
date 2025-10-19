import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getPayments } from "@/modules/utility-payment/filters/get-payments";
import { UtilityPaymentsView } from "@/modules/utility-payment/ui/views/utility-payments-view";

export const metadata: Metadata = {
  title: "Utility Payments",
  description: "List of counter",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const UtilityPayments = async ({ searchParams }: Props) => {
  const params = await getPayments(searchParams);

  prefetch(
    trpc.utilityPayment.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <UtilityPaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default UtilityPayments;
