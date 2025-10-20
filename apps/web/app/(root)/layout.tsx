import { EngagespotProvider } from "@/components/engagespot-provider";
import { ModalProvider } from "@/components/modal-provider";
import { getAuth } from "@/lib/get-auth";
import { AuthGuard } from "@/modules/auth/ui/views/auth-guard";
import { DashboardLayout } from "@/modules/ui/layout";
import { Toaster } from "@workspace/ui/components/sonner";

interface RootLayoutProps {
  children: React.ReactNode;
}

const RootLayout = async ({ children }: RootLayoutProps) => {
  const { session } = await getAuth();

  if (!session || !session.user) return null;

  return (
    <AuthGuard>
      <EngagespotProvider userId={session.user.id}>
        <DashboardLayout>
          {children}
          <ModalProvider />
          <Toaster duration={3000} />
        </DashboardLayout>
      </EngagespotProvider>
    </AuthGuard>
  );
};

export default RootLayout;
