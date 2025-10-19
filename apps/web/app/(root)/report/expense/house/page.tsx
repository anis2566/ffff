import { Metadata } from "next";
import { SearchParams } from "nuqs";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { HouseExpenseReportView } from "@/modules/report/ui/views/house-expense-report-view";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "House Expense Report",
  description: "House Expense Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const HouseExpenseReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);

  prefetch(trpc.report.houseExpense.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <HouseExpenseReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default HouseExpenseReport;
