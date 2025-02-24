import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { db } from "@/server/db";
import { GetServerSideProps } from "next";
import type { gym_occupancy } from "@prisma/client";
import type { InferGetServerSidePropsType } from "next";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const getServerSideProps: GetServerSideProps = async () => {
  const chartData: gym_occupancy[] = await db.gym_occupancy.findMany();
  const serializedChartData = chartData.map((item) => ({
    ...item,
    timestamp: item.timestamp.toISOString(),
    formattedDate: new Date(item.timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    formattedTime: new Date(item.timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
  const referenceDate = new Date();
  return {
    props: {
      chartData: serializedChartData,
      serverReferenceDate: referenceDate.toISOString(),
    },
  };
};

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  occupency: {
    label: "occupancy_level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function Component({
  chartData,
  serverReferenceDate,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [timeRange, setTimeRange] = React.useState("90d");

  interface ChartDataItem {
    timestamp: string;
    formattedDate: string;
    formattedTime: string;
  }

  interface FilteredDataItem extends ChartDataItem {}

  const filteredData: FilteredDataItem[] = chartData.filter(
    (item: ChartDataItem) => {
      const date = new Date(item.timestamp);
      const referenceDate = React.useMemo(
        () => new Date(serverReferenceDate),
        [serverReferenceDate],
      );
      let daysToSubtract = 90;
      if (timeRange === "30d") {
        daysToSubtract = 30;
      } else if (timeRange === "7d") {
        daysToSubtract = 7;
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    },
  );

  console.log(filteredData);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total visitors for the last 3 months
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-white">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-desktop)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-mobile)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value, payload) => {
                    const item = payload && payload[0] && payload[0].payload;
                    return item
                      ? `${item.formattedDate} ${item.formattedTime}`
                      : value;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="occupancy_level"
              type="natural"
              fill="#8884d8"
              stroke="#8884d8"
              stackId="a"
              name="Occupancy:"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
