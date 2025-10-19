import { redirect } from "next/navigation";

import { getAuth } from "@/lib/get-auth";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = async ({ children }: AuthLayoutProps) => {
  const { isAuthenticated } = await getAuth();
  
  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="w-full h-full min-h-screen flex items-center justify-center">
      {children}
    </div>
  );
};

export default AuthLayout;
