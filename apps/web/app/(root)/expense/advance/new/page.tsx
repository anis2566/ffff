import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewAdvanceView } from "@/modules/teacher-advance/ui/view/new-advance-view";

export const metadata: Metadata = {
  title: "New Advance",
  description: "Form to create a new teacher advance",
};

const NewAdvance = () => {
  return (
    <ContentLayout>
      <NewAdvanceView />
    </ContentLayout>
  );
};

export default NewAdvance;
