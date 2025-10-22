import Loader from "@/components/loader";
import { getAuth } from "@/lib/get-auth";
import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { DashboardView } from "@/modules/ui/views/dashboard-view";
import { prisma } from "@workspace/db";
import { currentSession } from "@workspace/utils/constant";
import { Suspense } from "react";

const Dashboard = async () => {
  const { roles } = await getAuth();
  return (
    <ContentLayout>
      <Suspense fallback={<Loader />}>
        <DashboardView roles={roles} />
      </Suspense>
    </ContentLayout>
  );
};

export default Dashboard;
