"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@workspace/ui/shared/stat-card";
import {
  UserRoundCheck,
  UserRoundPen,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { StudentsOverview } from "../chart/students-overview";
import { ThisMonthAdmmissionsLeavings } from "../chart/this-month-admissions-leavings";
import { ThisMonthSalaries } from "../chart/this-month-salaries";
import Loader from "@/components/loader";

export const AdminDashboard = () => {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(trpc.dashboard.admin.queryOptions());

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={data?.totalStudent?.toString() || "0"}
          icon={UsersRound}
        />
        <StatCard
          title="Present Students"
          value={data?.presentStudent?.toString() || "0"}
          icon={UserRoundCheck}
        />
        <StatCard
          title="Absent Students"
          value={data?.absentStudent?.toString() || "0"}
          icon={UserRoundX}
        />
        <StatCard
          title="Total Teachers"
          value={data?.totalTeacher?.toString() || "0"}
          icon={UserRoundPen}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ThisMonthAdmmissionsLeavings
          thisMonthAdmissionsLeavings={data?.thisMonthAdmissionsLeavings || []}
        />
        <ThisMonthSalaries thisMonthSalaries={data?.salariesByClass || []} />
        <StudentsOverview studentsByClass={data?.studentsByClass || []} />
      </div>
    </div>
  );
};
