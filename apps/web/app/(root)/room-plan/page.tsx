import { Metadata } from "next"

import { HydrateClient, prefetch, trpc } from "@/trpc/server";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { RoomPlanView } from "@/modules/room-plan/ui/views/room-plan-view";

export const metadata: Metadata = {
  title: "Room Plan",
  description: "Room Plan",
};

const RoomPlan = async () => {
  prefetch(trpc.batch.getRoomPlan.queryOptions());

  return (
    <ContentLayout>
      <HydrateClient>
        <RoomPlanView />
      </HydrateClient>
    </ContentLayout>
  );
};

export default RoomPlan;
