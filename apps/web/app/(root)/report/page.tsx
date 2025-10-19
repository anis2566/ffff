import { Metadata } from "next";
import { SearchParams } from "nuqs";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { OverviewReportView } from "@/modules/report/ui/views/overview-report-view";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "Overview Report",
  description: "Overview Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const OverviewReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);

  prefetch(trpc.report.overview.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <OverviewReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default OverviewReport;
