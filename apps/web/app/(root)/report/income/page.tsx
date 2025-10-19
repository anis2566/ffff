import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { IncomeReportView } from "@/modules/report/ui/views/income-report-view";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "Income Report",
  description: "Income Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const IncomeReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);

  prefetch(trpc.report.income.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <IncomeReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default IncomeReport;
