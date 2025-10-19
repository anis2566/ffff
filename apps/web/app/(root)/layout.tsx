import { ModalProvider } from "@/components/modal-provider";
import { AuthGuard } from "@/modules/auth/ui/views/auth-guard";
import { DashboardLayout } from "@/modules/ui/layout";
import { Toaster } from "@workspace/ui/components/sonner";
import { RegisterServiceWorker } from "@/components/register-service-worker";
import { NotificationBanner } from "@/components/notification-banner";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <AuthGuard>
      <DashboardLayout>
        {children}
        <RegisterServiceWorker />
        <NotificationBanner />
        <ModalProvider />
        <Toaster duration={3000} />
      </DashboardLayout>
    </AuthGuard>
  );
};

export default RootLayout;
