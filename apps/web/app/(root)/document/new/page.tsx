import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewDocumentView } from "@/modules/exam/ui/views/new-document-view";

export const metadata: Metadata = {
  title: "New Document",
  description: "Assign document to the system",
};

const NewDocument = () => {
  return (
    <ContentLayout>
      <NewDocumentView />
    </ContentLayout>
  );
};

export default NewDocument;
