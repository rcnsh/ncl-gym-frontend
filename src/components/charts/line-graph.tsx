import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import type { gym_occupancy } from "@prisma/client";

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
import { Slider } from "@/components/ui/slider";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  occupency: {
    label: "occupancy_level",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function LineGraph({
  chartData,
  serverReferenceDate,
}: {
  chartData: gym_occupancy[];
  serverReferenceDate: string;
}) {
  const [timeRange, setTimeRange] = React.useState("30");

  interface FilteredDataItem extends gym_occupancy {}

  const filteredData: FilteredDataItem[] = chartData.filter(
    (item: gym_occupancy) => {
      const date = new Date(item.timestamp);
      const referenceDate = React.useMemo(
        () => new Date(serverReferenceDate),
        [serverReferenceDate],
      );
      let daysToSubtract = 30;
      if (timeRange === "7") {
        daysToSubtract = 7;
      } else if (timeRange === "1") {
        daysToSubtract = 1;
      } else {
        daysToSubtract = parseInt(timeRange);
      }
      const startDate = new Date(referenceDate);
      startDate.setDate(startDate.getDate() - daysToSubtract);
      return date >= startDate;
    },
  );

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>
            Showing total visitors for the last month
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last month" />
          </SelectTrigger>
          <SelectContent className="min-h-[130px] rounded-xl bg-white">
            <SelectItem value="30" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7" className="rounded-lg">
              Last 7 days
            </SelectItem>
            <SelectItem value="1" className="rounded-lg">
              Last 24 hours
            </SelectItem>
            <Slider
              defaultValue={[14]}
              min={1}
              max={30}
              step={1}
              onValueChange={(value) => {
                if (value[0] !== undefined) {
                  setTimeRange(value[0].toString());
                }
              }}
              className="rounded-lg bg-gray-200"
            />
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
                  indicator="line"
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
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
