import { Metadata } from "next";

import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { NewHouseView } from "@/modules/house/ui/views/new-house-view";

export const metadata: Metadata = {
  title: "New House",
  description: "Assign house to the system",
};

const NewHouse = () => {
  return (
    <ContentLayout>
      <NewHouseView />
    </ContentLayout>
  );
};

export default NewHouse;
