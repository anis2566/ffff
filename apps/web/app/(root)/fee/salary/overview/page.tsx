import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getOverview } from "@/modules/salary-payment/filters/get-overview";
import { SalaryPaymentsOverviewView } from "@/modules/salary-payment/ui/view/salary-payment-overview-view";

export const metadata: Metadata = {
  title: "Payments Overview",
  description: "Overview of payments",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const SalaryPaymentsOverview = async ({ searchParams }: Props) => {
  const params = await getOverview(searchParams);

  prefetch(
    trpc.salaryPayment.getOverview.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <SalaryPaymentsOverviewView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default SalaryPaymentsOverview;
