import { redirect } from "next/navigation";

import { getAuth } from "@/lib/get-auth";
import { ROLE } from "@workspace/utils/constant";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = async ({ children }: AuthGuardProps) => {
  const { roles } = await getAuth();

  // ✅ Make this an array of allowed roles
  const adminRoles = [
    ROLE.Admin,
    ROLE.HR,
    ROLE.Management,
    ROLE.Accountant,
    ROLE["Office Assistant"],
    ROLE["Computer Operator"],
  ];

  // ✅ Check if the user has at least one matching role
  const isAuthorized = roles.some((role) => adminRoles.includes(role as ROLE));

  if (!isAuthorized) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
};
