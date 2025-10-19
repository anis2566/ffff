"use client";

import { useTRPC } from "@/trpc/react";
import { useQuery } from "@tanstack/react-query";

import { AnalyticStatCard } from "@workspace/ui/shared/analytic-stat-card";
import { DollarSign } from "lucide-react";

import Loader from "@/components/loader";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { ThisMonthSalaryChart } from "../chart/account/this-month-salary-chart";
import { LastMonthSalaryChart } from "../chart/account/last-month-salary-chart";
import { OverallSalaryChart } from "../chart/account/overall-salary-chart";
import { RecentSalaries } from "./account/recent-salaries";
import { TodaySalariesChart } from "../chart/account/today-salary-chart";
import { ThisMonthUnpaidSalariesChart } from "../chart/account/this-month-unpaid-salary";
import { TodoContainer } from "./todo-container";

export const AccountDashboard = () => {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(trpc.dashboard.account.queryOptions());

  if (isLoading) return <Loader />;

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalyticStatCard
              title="This Month Salary"
              primaryValue={data?.thisMonthPaidSalaryCount || 0}
              secondaryValue={data?.thisMonthSalaryCount}
              icon={DollarSign}
              percent={
                data?.thisMonthSalaryCount && data?.thisMonthPaidSalaryCount
                  ? Math.round(
                      (data.thisMonthPaidSalaryCount /
                        data.thisMonthSalaryCount) *
                        100
                    )
                  : 0
              }
            />
            <AnalyticStatCard
              title="Last Month Salary"
              primaryValue={data?.lastMonthPaidSalaryCount || 0}
              secondaryValue={data?.lastMonthSalaryCount}
              icon={DollarSign}
              percent={
                data?.lastMonthSalaryCount && data?.lastMonthPaidSalaryCount
                  ? Math.round(
                      (data.lastMonthPaidSalaryCount /
                        data.lastMonthSalaryCount) *
                        100
                    )
                  : 0
              }
            />
            <AnalyticStatCard
              title="Overall Salary"
              primaryValue={data?.totalPaidSalaryCount || 0}
              secondaryValue={data?.totalSalaryCount}
              icon={DollarSign}
              percent={
                data?.totalSalaryCount && data?.totalPaidSalaryCount
                  ? Math.round(
                      (data.totalPaidSalaryCount / data.totalSalaryCount) * 100
                    )
                  : 0
              }
            />
          </div>
          <CardWrapper>
            <Tabs defaultValue="thisMonth" className="w-full">
              <TabsList>
                <TabsTrigger value="thisMonth">This Month</TabsTrigger>
                <TabsTrigger value="lastMonth">Last Month</TabsTrigger>
                <TabsTrigger value="overall">Overall</TabsTrigger>
              </TabsList>
              <TabsContent value="thisMonth">
                <ThisMonthSalaryChart data={data?.thisMonthSalaries ?? []} />
              </TabsContent>
              <TabsContent value="lastMonth">
                <LastMonthSalaryChart data={data?.lastMonthSalaries ?? []} />
              </TabsContent>
              <TabsContent value="overall">
                <OverallSalaryChart data={data?.overallSalaries ?? []} />
              </TabsContent>
            </Tabs>
          </CardWrapper>

          <RecentSalaries payments={data?.recentSalaries || []} />
        </div>
        <div className="md:col-span-2 w-full flex flex-col gap-6">
          <TodoContainer />
          <TodaySalariesChart data={data?.todaySalaries || []} />
          <ThisMonthUnpaidSalariesChart
            data={data?.thisMonthUnpaidSalaries || []}
          />
        </div>
      </div>
    </div>
  );
};
