import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { SalaryIncomeReportView } from "@/modules/report/ui/views/salary-income-report-view";
import { SearchParams } from "nuqs";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "Salary Income Report",
  description: "Salary Income Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const SalaryIncomeReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);

  prefetch(trpc.report.salaryIncome.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <SalaryIncomeReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default SalaryIncomeReport;
