import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewExamView } from "@/modules/exam/ui/views/new-exam-view";

export const metadata: Metadata = {
  title: "New Exam",
  description: "Assign exam to the system",
};

const NewExam = () => {
  return (
    <ContentLayout>
      <NewExamView />
    </ContentLayout>
  );
};

export default NewExam;
