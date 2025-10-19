import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewExamResultView } from "@/modules/exam/ui/views/new-exam-result-view";

export const metadata: Metadata = {
  title: "New Exam Result",
  description: "Assign exam result to the system",
};

const NewExamResult = () => {
  return (
    <ContentLayout>
      <NewExamResultView />
    </ContentLayout>
  );
};

export default NewExamResult;
