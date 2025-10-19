import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import { AdminDashboard } from "../components/admin-dashboard";
import { AccountDashboard } from "../components/account-dashboard";

export const DashboardView = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="account">
        <TabsList className="w-full max-w-fit rounded-xs mb-2 bg-muted">
          <TabsTrigger value="admin">Admin</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
        <TabsContent value="admin">
          <AdminDashboard />
        </TabsContent>
        <TabsContent value="account">
          <AccountDashboard />
        </TabsContent>
    </Tabs>
    </div>
  );
};
