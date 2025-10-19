import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewTeacherView } from "@/modules/teacher/ui/view/new-teacher-view";

export const metadata: Metadata = {
  title: "New Teacher",
  description: "Assign teacher to the system",
};

const NewTeacher = () => {
  return (
    <ContentLayout>
      <NewTeacherView />
    </ContentLayout>
  );
};

export default NewTeacher;
