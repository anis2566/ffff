import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getRoles } from "@/modules/role/filters/get-roles";
import { RolesView } from "@/modules/role/ui/views/roles-view";

export const metadata: Metadata = {
  title: "Roles",
  description: "List of roles",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Roles = async ({ searchParams }: Props) => {
  const params = await getRoles(searchParams);
  prefetch(trpc.role.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <RolesView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Roles;
