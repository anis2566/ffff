import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";

import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { EditRoomView } from "@/modules/room/ui/views/edit-room-view";

export const metadata: Metadata = {
  title: "Edit room",
  description: "Form to edit an existing room",
};

interface Props {
  params: Promise<{ id: string }>;
}

const EditRoom = async ({ params }: Props) => {
  const { id } = await params;

  prefetch(trpc.room.getOne.queryOptions(id));

  return (
    <ContentLayout>
      <HydrateClient>
        <EditRoomView id={id} />
      </HydrateClient>
    </ContentLayout>
  );
};

export default EditRoom;
