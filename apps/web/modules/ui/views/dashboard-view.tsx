import { AdminDashboard } from "../components/admin-dashboard";
import { AccountDashboard } from "../components/account-dashboard";
import { ROLE } from "@workspace/utils/constant";
import { ComputerOperatorDashboard } from "../components/computer-operator-dashboard";

interface DashboardProps {
  roles: string[];
}

export const DashboardView = ({ roles }: DashboardProps) => {
  if (roles.includes(ROLE.Accountant)) {
    return <AccountDashboard />;
  } else if (roles.includes(ROLE["Computer Operator"])) {
    return <ComputerOperatorDashboard />;
  }

  return <AdminDashboard />;
};
