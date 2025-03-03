import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { gym_occupancy } from "@prisma/client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  occupency: {
    label: "occupancy_level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function BarGraph({
  chartData,
}: {
  chartData: gym_occupancy[];
}) {
  const processedData = chartData.reduce<
    Record<string, { total: number; count: number; date: Date }>
  >((acc, item) => {
    const date = new Date(item.timestamp);
    const dateString = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    if (item.occupancy_level === 0) return acc;

    if (!acc[dateString]) {
      acc[dateString] = { total: 0, count: 0, date };
    }

    acc[dateString].total += item.occupancy_level;
    acc[dateString].count += 1;

    return acc;
  }, {});

  const dailyAverages = Object.entries(processedData)
    .sort(
      (a, b) => new Date(b[1].date).getTime() - new Date(a[1].date).getTime(),
    )
    .slice(0, 7)
    .map(([day, data]) => {
      const avgOccupancy = Math.round(data.total / data.count);
      const dayOfWeek = data.date.toLocaleDateString("en-US", {
        weekday: "short",
      });

      return {
        day,
        dayOfWeek,
        occupancy_level: avgOccupancy,
      };
    })
    .reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Most Popular Gym Days: Last week</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={dailyAverages}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="dayOfWeek"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="occupancy_level"
              fill="#b975f7"
              radius={8}
              name={"Average occupancy: "}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
