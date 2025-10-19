import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { OtherIncomeReportView } from "@/modules/report/ui/views/other-payment-report-view";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "Other Income Report",
  description: "Other Income Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const OtherIncomeReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);

  prefetch(trpc.report.otherIncome.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <OtherIncomeReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default OtherIncomeReport;
