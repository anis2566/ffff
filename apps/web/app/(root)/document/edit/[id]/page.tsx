import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import EditDocumentView from "@/modules/exam/ui/views/edit-document-view";

export const metadata: Metadata = {
  title: "Edit Document",
  description: "Update details of an existing document",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditDocument = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.document.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditDocumentView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditDocument;
