"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import ComponentCard from "@/components/layout/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface RegionalData {
  region_id?: string;
  region_name?: string;
  beneficiaries?: number;
  incidents?: number;
  cases?: number;
  projects?: number;
}

interface RegionalDistributionChartProps {
  data: RegionalData[];
  loading?: boolean;
}

export default function RegionalDistributionChart({
  data,
  loading = false,
}: RegionalDistributionChartProps) {
  if (loading) {
    return (
      <ComponentCard title="Regional Distribution">
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-600">Loading chart...</div>
        </div>
      </ComponentCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ComponentCard title="Regional Distribution">
        <div className="h-[350px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 dark:text-gray-600">No regional data available</p>
          </div>
        </div>
      </ComponentCard>
    );
  }

  const regionNames = data.map(r => r.region_name || 'Unknown Region');
  const beneficiaries = data.map(r => r.beneficiaries || 0);
  const projects = data.map(r => r.projects || 0);
  const incidents = data.map(r => r.incidents || 0);

  const options: ApexOptions = {
    colors: ["#D32F2F", "#F44336", "#EF5350"],
    chart: {
      fontFamily: "Metropolis, sans-serif",
      type: "bar",
      height: 350,
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: regionNames,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Count",
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Metropolis",
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => val.toLocaleString(),
      },
    },
  };

  const series = [
    {
      name: "Beneficiaries",
      data: beneficiaries,
    },
    {
      name: "Projects",
      data: projects,
    },
    {
      name: "Incidents",
      data: incidents,
    },
  ];

  return (
    <ComponentCard
      title="Regional Distribution"
      desc="Overview of activities across regions"
    >
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
