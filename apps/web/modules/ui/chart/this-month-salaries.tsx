"use client";

import { Bar, BarChart, Legend, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { MONTH } from "@workspace/utils/constant";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

// Vibrant color palette
const colorPalette = [
  "hsl(12, 76%, 61%)", // Red-orange
  "hsl(173, 58%, 39%)", // Teal
  "hsl(262, 83%, 58%)", // Purple
  "hsl(43, 74%, 66%)", // Yellow
  "hsl(142, 76%, 36%)", // Green
  "hsl(339, 82%, 52%)", // Pink
  "hsl(221, 83%, 53%)", // Blue
  "hsl(27, 87%, 67%)", // Orange
];

const chartConfig = {
  paid: {
    label: "Paid",
    color: colorPalette[0],
  },
  unpaid: {
    label: "Unpaid",
    color: colorPalette[1],
  },
} satisfies ChartConfig;

interface Props {
  thisMonthSalaries: {
    className: string;
    paid: number;
    unpaid: number;
  }[];
}

export function ThisMonthSalaries({ thisMonthSalaries }: Props) {
  return (
    <CardWrapper
      title="This Month Salaries"
      description={`${Object.values(MONTH)[new Date().getMonth()]}-${new Date().getFullYear()}`}
    >
      <ChartContainer config={chartConfig} className="w-full">
        <BarChart accessibilityLayer data={thisMonthSalaries}>
          <XAxis
            dataKey="className"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value}
          />
          <Bar
            dataKey="paid"
            stackId="a"
            fill={chartConfig.paid.color}
            radius={[0, 0, 4, 4]}
          />
          <Bar
            dataKey="unpaid"
            stackId="a"
            fill={chartConfig.unpaid.color}
            radius={[4, 4, 0, 0]}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) =>
              chartConfig[value as keyof typeof chartConfig]?.label ?? value
            }
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={false}
            defaultIndex={1}
          />
        </BarChart>
      </ChartContainer>
    </CardWrapper>
  );
}
