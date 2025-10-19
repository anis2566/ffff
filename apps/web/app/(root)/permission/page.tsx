import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getPermissions } from "@/modules/permission/filters/get-permissions";
import { PermissionsView } from "@/modules/permission/ui/views/permissions-view";

export const metadata: Metadata = {
  title: "Permissions",
  description: "List of permissions",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Permissions = async ({ searchParams }: Props) => {
  const params = await getPermissions(searchParams);
  prefetch(trpc.permission.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <PermissionsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Permissions;
