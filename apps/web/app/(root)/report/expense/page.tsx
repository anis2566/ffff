import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { ExpenseReportView } from "@/modules/report/ui/views/expense-report-view";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "Expense Report",
  description: "Expense Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const ExpenseReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);
  prefetch(trpc.report.expense.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <ExpenseReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default ExpenseReport;
