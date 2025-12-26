"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import ComponentCard from "@/components/layout/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export interface ProjectPerformanceData {
  project_id?: string;
  title?: string;
  total_activities?: number;
  completed_activities?: number;
}

interface ProjectPerformanceChartProps {
  data: ProjectPerformanceData[];
  loading?: boolean;
}

export default function ProjectPerformanceChart({
  data,
  loading = false,
}: ProjectPerformanceChartProps) {
  if (loading) {
    return (
      <ComponentCard title="Project Performance">
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-600">Loading chart...</div>
        </div>
      </ComponentCard>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ComponentCard title="Project Performance">
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 dark:text-gray-600">No project data available</p>
          </div>
        </div>
      </ComponentCard>
    );
  }

  // Calculate completion rates
  const projectNames = data.map(p => {
    const title = p.title || 'Untitled Project';
    return title.length > 20 ? title.substring(0, 20) + '...' : title;
  });
  const completionRates = data.map(p => {
    const total = p.total_activities || 0;
    const completed = p.completed_activities || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  });

  const options: ApexOptions = {
    colors: ["#D32F2F"],
    chart: {
      fontFamily: "Metropolis, sans-serif",
      type: "bar",
      height: 300,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "55%",
        borderRadius: 5,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}%`,
      offsetX: 30,
      style: {
        fontSize: '12px',
        colors: ['#374151']
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: projectNames,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        formatter: (val: string) => `${val}%`,
      },
      max: 100,
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      xaxis: {
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
        formatter: (val: number, { dataPointIndex }) => {
          const project = data[dataPointIndex];
          const completed = project.completed_activities || 0;
          const total = project.total_activities || 0;
          return `${completed}/${total} activities completed (${val}%)`;
        },
      },
    },
  };

  const series = [
    {
      name: "Completion Rate",
      data: completionRates,
    },
  ];

  return (
    <ComponentCard
      title="Project Performance"
      desc="Activity completion rates by project"
    >
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[500px]">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={300}
          />
        </div>
      </div>
    </ComponentCard>
  );
}
