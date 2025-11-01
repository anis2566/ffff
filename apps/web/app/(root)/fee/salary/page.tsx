import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getPayments } from "@/modules/salary-payment/filters/get-payments";
import { SalaryPaymentsView } from "@/modules/salary-payment/ui/view/salary-payments-view";

export const metadata: Metadata = {
  title: "Income | Salary",
  description: "List of salary incomes",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const SalaryPayments = async ({ searchParams }: Props) => {
  const params = await getPayments(searchParams);

  prefetch(
    trpc.salaryPayment.getMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <SalaryPaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default SalaryPayments;
