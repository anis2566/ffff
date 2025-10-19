"use client";

import { CartesianGrid, Legend, Line, LineChart, XAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { MONTH } from "@workspace/utils/constant";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

// Vibrant color palette for lines
const lineColors = [
  "hsl(12, 76%, 61%)", // Red-orange
  "hsl(173, 58%, 39%)", // Teal
  "hsl(262, 83%, 58%)", // Purple
  "hsl(43, 74%, 66%)", // Yellow
  "hsl(142, 76%, 36%)", // Green
  "hsl(339, 82%, 52%)", // Pink
  "hsl(221, 83%, 53%)", // Blue
  "hsl(27, 87%, 67%)", // Orange
];

// Function to generate random color
const generateRandomColor = (index: number) => {
  const hue = (index * 137.508) % 360;
  const saturation = 65 + ((index * 5) % 20);
  const lightness = 50 + ((index * 3) % 15);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const chartConfig = {
  admissions: {
    label: "Admissions",
    color: lineColors[0],
  },
  leavings: {
    label: "Leavings",
    color: lineColors[1],
  },
} satisfies ChartConfig;

interface Props {
  thisMonthAdmissionsLeavings: {
    day: number;
    admissions: number;
    leavings: number;
  }[];
}

export function ThisMonthAdmmissionsLeavings({
  thisMonthAdmissionsLeavings,
}: Props) {
  return (
    <CardWrapper
      title="Admission x Leaving"
      description={`${Object.values(MONTH)[new Date().getMonth()]}-${new Date().getFullYear()}`}
    >
      <ChartContainer
        config={chartConfig}
        className="h-full max-h-[200px] w-full"
      >
        <LineChart
          accessibilityLayer
          data={thisMonthAdmissionsLeavings}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) =>
              chartConfig[value as keyof typeof chartConfig]?.label ?? value
            }
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent labelFormatter={(value) => `Day ${value}`} />
            }
          />
          <Line
            dataKey="admissions"
            type="monotone"
            stroke={chartConfig.admissions.color}
            strokeWidth={2}
            dot={false}
            name="Admissions"
          />
          <Line
            dataKey="leavings"
            type="monotone"
            stroke={chartConfig.leavings.color}
            strokeWidth={2}
            dot={false}
            name="Leavings"
          />
        </LineChart>
      </ChartContainer>
    </CardWrapper>
  );
}
