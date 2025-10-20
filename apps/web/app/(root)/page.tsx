import { ContentLayout } from "@/modules/ui/layout/content-layout";
import { DashboardView } from "@/modules/ui/views/dashboard-view";
import { prisma } from "@workspace/db";
import { Suspense } from "react";

const Dashboard = async () => {
  // await prisma.permission.deleteMany();
  // await prisma.role.updateMany({
  //   data: {
  //     permissionIds: {
  //       set: [],
  //     },
  //   }
  // })
  return (
    <ContentLayout>
      <Suspense fallback={<div>Loading...</div>}>Dashboard</Suspense>
    </ContentLayout>
  );
};

export default Dashboard;
