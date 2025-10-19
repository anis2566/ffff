import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewRoomView } from "@/modules/room/ui/views/new-room-view";

export const metadata: Metadata = {
  title: "New Room",
  description: "Assign room to the system",
};

const NewRoom = () => {
  return (
    <ContentLayout>
      <NewRoomView />
    </ContentLayout>
  );
};

export default NewRoom;
