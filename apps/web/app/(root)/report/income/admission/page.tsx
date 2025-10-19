import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { AdmissionIncomeReportView } from "@/modules/report/ui/views/admission-income-report-view";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "Admission Income Report",
  description: "Admission Income Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const AdmissionIncomeReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);

  prefetch(trpc.report.admissionIncome.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <AdmissionIncomeReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default AdmissionIncomeReport;
