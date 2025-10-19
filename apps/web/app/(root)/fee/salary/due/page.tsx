import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getDuePayments } from "@/modules/fee/filters/get-due-payments";
import { DueSalaryPaymentsView } from "@/modules/fee/ui/view/due-salary-payments-view";

export const metadata: Metadata = {
  title: "Due Payments",
  description: "List of due salary incomes",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const DueSalaryPayments = async ({ searchParams }: Props) => {
  const params = await getDuePayments(searchParams);

  prefetch(
    trpc.salaryPayment.getDueMany.queryOptions({
      ...params,
    })
  );

  return (
    <ContentLayout>
      <HydrateClient>
        <DueSalaryPaymentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default DueSalaryPayments;
