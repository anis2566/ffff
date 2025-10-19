import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { AdmissionView } from "@/modules/admission/ui/view/admission-view";

export const metadata: Metadata = {
  title: "Admission",
  description: "Assign student to admission",
};

const Admission = () => {
  return (
    <ContentLayout>
      <AdmissionView />
    </ContentLayout>
  );
};

export default Admission;
