import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getUsers } from "@/modules/user/filters/get-users";
import { UsersView } from "@/modules/user/ui/views/users-view";

export const metadata: Metadata = {
  title: "Users",
  description: "List of users",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Users = async ({ searchParams }: Props) => {
  const params = await getUsers(searchParams);
  prefetch(trpc.user.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <UsersView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Users;
