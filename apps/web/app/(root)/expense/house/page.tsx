import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getPayments } from "@/modules/house-payment/filters/get-payments";
import { HousePaymentsView } from "@/modules/house-payment/ui/views/house-payments-view";

export const metadata: Metadata = {
  title: "Houses Payment",
  description: "List of houses payment",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const HousesPayments = async ({ searchParams }: Props) => {
  const params = await getPayments(searchParams);

  prefetch(
    trpc.housePayment.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <HousePaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default HousesPayments;
