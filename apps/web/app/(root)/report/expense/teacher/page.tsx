import { Metadata } from "next";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { SearchParams } from "nuqs";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { TeacherExpenseReportView } from "@/modules/report/ui/views/teacher-expense-report-view";
import { getSessions } from "@/modules/report/filters/get-session";

export const metadata: Metadata = {
  title: "Teacher Expense Report",
  description: "Teacher Expense Report",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const TeachrExpenseReport = async ({ searchParams }: Props) => {
  const params = await getSessions(searchParams);
  prefetch(trpc.report.teacherExpense.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <TeacherExpenseReportView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default TeachrExpenseReport;
