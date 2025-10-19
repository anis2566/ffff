import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewHomeworkView } from "@/modules/homework/ui/views/new-homework-view";

export const metadata: Metadata = {
  title: "New Homework",
  description: "Assign homework to the system",
};

const NewHomework = () => {
  return (
    <ContentLayout>
      <NewHomeworkView />
    </ContentLayout>
  );
};

export default NewHomework;
