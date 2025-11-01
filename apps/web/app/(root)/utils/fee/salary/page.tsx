import type { Metadata } from "next";
import type { SearchParams } from "nuqs";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { SalaryFeesView } from "@/modules/salary-fee/ui/view/salary-fees-view";
import { getSalaryFees } from "@/modules/salary-fee/filters/get-salary-fees";

export const metadata: Metadata = {
  title: "Salary Fees",
  description: "List of salary fees",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const SalaryFees = async ({ searchParams }: Props) => {
  const params = await getSalaryFees(searchParams);
  await prefetch(trpc.salaryFee.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <SalaryFeesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default SalaryFees;
