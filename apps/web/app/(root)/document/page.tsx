import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getDocuments } from "@/modules/exam/filters/get-documents";
import { DocumentsView } from "@/modules/exam/ui/views/documents-view";

export const metadata: Metadata = {
  title: "Documents",
  description: "List of documents",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Documents = async ({ searchParams }: Props) => {
  const params = await getDocuments(searchParams);
  prefetch(trpc.document.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <DocumentsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Documents;
