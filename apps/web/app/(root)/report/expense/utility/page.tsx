import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { UtilityExpenseReportView } from "@/modules/report/ui/views/utility-expense-report-view";
import { getSessions } from "@/modules/report/filters/get-session";
import { SearchParams } from "nuqs";

export const metadata: Metadata = {
  title: "Utility Expense Report",
  description: "Utility Expense Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const UtilityExpenseReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);

  prefetch(trpc.report.utilityExpense.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <UtilityExpenseReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default UtilityExpenseReport;
