import { SearchParams } from "nuqs";
import { Metadata } from "next";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { getRooms } from "@/modules/room/filters/get-rooms";
import { RoomsView } from "@/modules/room/ui/views/rooms-view";

export const metadata: Metadata = {
  title: "Rooms",
  description: "List of rooms",
};

interface Props {
  searchParams: Promise<SearchParams>;
}

const Rooms = async ({ searchParams }: Props) => {
  const params = await getRooms(searchParams);
  prefetch(trpc.room.getMany.queryOptions(params));

  return (
    <ContentLayout>
      <HydrateClient>
        <RoomsView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default Rooms;
