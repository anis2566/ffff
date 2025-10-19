import { Suspense } from "react";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";

import { AppSidebar } from "./app-sidebar";
import Loader from "@/components/loader";
import { getServerPermissions } from "@/lib/get-permissions";

interface Props {
  children: React.ReactNode;
}

export const DashboardLayout = async ({ children }: Props) => {
  const permissionData = await getServerPermissions();

  return (
    <Suspense fallback={<Loader />}>
      <SidebarProvider>
        <AppSidebar
          initialPermissions={permissionData.permissions}
          initialRoles={permissionData.roles}
        />
        <SidebarInset className="flex-1 overflow-auto">{children}</SidebarInset>
      </SidebarProvider>
    </Suspense>
  );
};
