"use client";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { Pie, PieChart } from "recharts";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

const createChartConfig = (
  data: { className: string; total: number }[]
): ChartConfig => {
  const config: ChartConfig = {
    total: {
      label: "Total",
    },
  };

  data.forEach((item, index) => {
    config[item.className] = {
      label: item.className.charAt(0).toUpperCase() + item.className.slice(1),
      color: `var(--chart-${(index % 5) + 1})`,
    };
  });

  return config;
};

interface TodaySalariesChartProps {
  data: {
    className: string;
    total: number;
  }[];
}

export const TodaySalariesChart = ({ data }: TodaySalariesChartProps) => {
  // Transform data for the chart and add fill colors
  const chartData = data.map((item, index) => ({
    ...item,
    fill: `var(--chart-${(index % 5) + 1})`,
  }));

  const chartConfig = createChartConfig(data);

  return (
    <CardWrapper title="Today's Salary Count">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Pie data={chartData} dataKey="total" nameKey="className" />
        </PieChart>
      </ChartContainer>
    </CardWrapper>
  );
};
