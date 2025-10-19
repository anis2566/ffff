import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { DailyReportView } from "@/modules/report/ui/views/daily-report-view";
import { getDailyReports } from "@/modules/report/filters/get-daily-reports";

export const metadata: Metadata = {
  title: "Daily Report",
  description: "Daily Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const DailyReport = async ({ searchParams }: Props) => {
  const params = await getDailyReports(searchParams);

  prefetch(trpc.report.daily.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <DailyReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default DailyReport;
