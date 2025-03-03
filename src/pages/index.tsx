import Head from "next/head";
import LineGraph from "@/components/charts/line-graph";
import BarGraph from "@/components/charts/bar-chart";

import { db } from "@/server/db";
import { GetServerSideProps } from "next";
import type { gym_occupancy } from "@prisma/client";

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

export default function Home({
  chartData,
  serverReferenceDate,
}: {
  chartData: gym_occupancy[];
  serverReferenceDate: string;
}) {
  return (
    <main>
      <Head>
        <title>Home</title>
      </Head>
      <main>
        <h1>Home</h1>
        <div className="w-full">
          <LineGraph
            chartData={chartData}
            serverReferenceDate={serverReferenceDate}
          />
        </div>
        <div className="w-1/3">
          <BarGraph chartData={chartData} />
        </div>
      </main>
    </main>
  );
}
