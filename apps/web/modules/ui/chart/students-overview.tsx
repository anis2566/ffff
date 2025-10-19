"use client";

import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { CardWrapper } from "@workspace/ui/shared/card-wrapper";

const chartConfig = {
  total: {
    label: "Total",
  },
  students: {
    label: "Students",
  },
  leavings: {
    label: "Leavings",
  },
} satisfies ChartConfig;

// Function to generate random HSL colors
const generateRandomColor = (index: number) => {
  // Use index as seed for consistent colors per position
  const hue = (index * 137.508) % 360; // Golden angle for better distribution
  const saturation = 65 + ((index * 5) % 20); // 65-85%
  const lightness = 50 + ((index * 3) % 15); // 50-65%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Alternative: Predefined vibrant color palette
const colorPalette = [
  "hsl(12, 76%, 61%)", // Red-orange
  "hsl(173, 58%, 39%)", // Teal
  "hsl(197, 37%, 24%)", // Dark blue
  "hsl(43, 74%, 66%)", // Yellow
  "hsl(27, 87%, 67%)", // Orange
  "hsl(142, 76%, 36%)", // Green
  "hsl(262, 83%, 58%)", // Purple
  "hsl(339, 82%, 52%)", // Pink
  "hsl(221, 83%, 53%)", // Blue
  "hsl(48, 96%, 53%)", // Bright yellow
  "hsl(162, 63%, 41%)", // Mint green
  "hsl(291, 64%, 42%)", // Deep purple
];

interface Props {
  studentsByClass: {
    className: string | undefined;
    studentCount: number;
  }[];
}

export function StudentsOverview({ studentsByClass }: Props) {
  return (
    <CardWrapper title="Student Overview" contentClassName="h-full max-h-fit">
        <ChartContainer
        config={chartConfig}
        className="mx-auto -mt-10 aspect-square max-h-[250px]"
        >
        <PieChart>
            <ChartTooltip
            content={
                <ChartTooltipContent
                labelKey="value"
                nameKey="className"
                indicator="line"
                labelFormatter={(_, payload) => {
                    return payload?.[0]?.payload?.className || "Unknown";
                }}
                />
            }
            />
            <Pie
            data={studentsByClass.map((item, index) => ({
                ...item,
                // Option 1: Use predefined palette (cycles through if more classes than colors)
                fill: colorPalette[index % colorPalette.length],

                // Option 2: Use generated random colors (uncomment to use)
                // fill: generateRandomColor(index),
            }))}
            dataKey="studentCount"
            nameKey="className"
            outerRadius={60}
            label={({ className, studentCount }) =>
                `${className}: ${studentCount}`
            }
            />
        </PieChart>
        </ChartContainer>
    </CardWrapper>
  );
}
