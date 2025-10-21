"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import { StatCard } from "@workspace/ui/shared/stat-card";
import { FileCheck, FileClock, FileSpreadsheet } from "lucide-react";
import Loader from "@/components/loader";
import { UpcomingTasks } from "./upcoming-tasks";
import { TodoContainer } from "./todo-container";

export const ComputerOperatorDashboard = () => {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.dashboard.computerOperator.queryOptions()
  );

  if (isLoading) return <Loader />;

  return (
    <div className="space-y-6 w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-4 space-y-6">
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Tasks"
              value={data?.todayTotalDocuments?.toString() || "0"}
              icon={FileSpreadsheet}
            />
            <StatCard
              title="Completed Tasks"
              value={data?.todayTotalDocuments?.toString() || "0"}
              icon={FileCheck}
            />
            <StatCard
              title="Pending Tasks"
              value={data?.todayInProgressDocuments?.toString() || "0"}
              icon={FileClock}
            />
          </div>
          <UpcomingTasks tasks={data?.upcomingTasks ?? []} />
        </div>
        <div className="md:col-span-2">
          <TodoContainer />
        </div>
      </div>
    </div>
  );
};
