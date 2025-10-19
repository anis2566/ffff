"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

const chartConfig = {
  total: {
    label: "Total",
    color: "var(--chart-1)",
  },
  paid: {
    label: "Paid",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface LastMonthSalaryChartProps {
  data: {
    className: string;
    total: number;
    paid: number;
  }[];
}

export function LastMonthSalaryChart({ data }: LastMonthSalaryChartProps) {
  return (
    <ChartContainer config={chartConfig} className="max-h-[280px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="className"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 7)}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="total"
          stackId="a"
          fill="var(--color-total)"
          radius={[0, 0, 4, 4]}
          barSize={20}
        />
        <Bar
          dataKey="paid"
          stackId="a"
          fill="var(--color-paid)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
