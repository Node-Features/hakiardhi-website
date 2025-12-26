"use client";

import React, { useState, useCallback } from "react";
import SummaryCard from "@/components/features/dashboard/SummaryCard";
import DashboardFilters, { IntervalType } from "@/components/features/dashboard/DashboardFilters";
import ProjectPerformanceChart from "@/components/features/dashboard/ProjectPerformanceChart";
import RegionalDistributionChart from "@/components/features/dashboard/RegionalDistributionChart";
import Button from "@/components/ui/button/Button";
import { useDashboardData, useDashboardMetrics } from "@/hooks/useDashboardData";
import {
  GroupIcon,
  BoxIconLine,
} from "@/icons";

export default function DashboardPage() {
  const [filters, setFilters] = useState<{
    project_uuid: string | null;
    region_uuid: string | null;
    interval_type: IntervalType;
    year?: number;
    quarter?: number;
    month?: number;
    start_date?: string;
    end_date?: string;
  }>({
    project_uuid: null,
    region_uuid: null,
    interval_type: "year",
  });

  const { data, isLoading, isError, refresh } = useDashboardData(filters);
  const metrics = useDashboardMetrics(data);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleRefresh = useCallback(() => {
    refresh();
  }, [refresh]);

  // Error state
  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
            Failed to Load Dashboard
          </h2>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            There was an error loading the dashboard data.
          </p>
          <Button
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const global = data?.summary?.global;
  const projects = data?.summary?.projects || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Analytics Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor key metrics and insights across your projects
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilters
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        loading={isLoading}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <SummaryCard
          title="Total Projects"
          value={global?.others?.projects || 0}
          icon={<BoxIconLine className="text-gray-800 dark:text-white/90" />}
          loading={isLoading}
        />

        <SummaryCard
          title="Total Beneficiaries"
          value={global?.beneficiaries?.total || 0}
          icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
          loading={isLoading}
          breakdown={global?.beneficiaries ? [
            {
              label: 'Male',
              value: global.beneficiaries.male || 0,
              percentage: global.beneficiaries.percent_male || 0,
              color: 'bg-blue-500',
            },
            {
              label: 'Female',
              value: global.beneficiaries.female || 0,
              percentage: global.beneficiaries.percent_female || 0,
              color: 'bg-pink-500',
            },
            {
              label: 'Other',
              value: global.beneficiaries.other || 0,
              percentage: global.beneficiaries.percent_other || 0,
              color: 'bg-purple-500',
            },
          ].filter(item => item.value > 0) : undefined}
        />

        <SummaryCard
          title="Total Activities"
          value={metrics?.totalActivities || 0}
          icon={
            <svg
              className="text-gray-800 size-6 dark:text-white/90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          subtitle={metrics ? `${metrics.completedActivities}/${metrics.totalActivities} completed (${(metrics.activityCompletionRate || 0).toFixed(1)}%)` : undefined}
          loading={isLoading}
        />

        <SummaryCard
          title="Total Incidents"
          value={global?.incidents?.total || 0}
          icon={
            <svg
              className="text-gray-800 size-6 dark:text-white/90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          }
          loading={isLoading}
          breakdown={global?.incidents ? [
            {
              label: 'Land Conflict',
              value: global.incidents.land_conflict || 0,
              percentage: global.incidents.percent_land_conflict || 0,
              color: 'bg-red-500',
            },
            {
              label: 'Eviction',
              value: global.incidents.eviction || 0,
              percentage: global.incidents.percent_eviction || 0,
              color: 'bg-orange-500',
            },
            {
              label: 'Boundary Dispute',
              value: global.incidents.boundary_dispute || 0,
              percentage: global.incidents.percent_boundary_dispute || 0,
              color: 'bg-yellow-500',
            },
            {
              label: 'Other',
              value: global.incidents.other || 0,
              percentage: global.incidents.percent_other || 0,
              color: 'bg-gray-500',
            },
          ].filter(item => item.value > 0) : undefined}
        />
      </div>

      {/* Additional Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
        <SummaryCard
          title="Total Users"
          value={global?.others?.users || 0}
          icon={<GroupIcon className="text-gray-800 size-6 dark:text-white/90" />}
          loading={isLoading}
        />

        <SummaryCard
          title="Geography Coverage"
          value={global?.geography?.total_regions || 0}
          icon={
            <svg
              className="text-gray-800 size-6 dark:text-white/90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          }
          loading={isLoading}
          subtitle={global?.geography ? `${global.geography.districts} districts, ${global.geography.villages} villages` : undefined}
          breakdown={global?.geography ? [
            {
              label: 'Districts',
              value: global.geography.districts || 0,
              percentage: global.geography.percent_districts || 0,
              color: 'bg-green-500',
            },
            {
              label: 'Villages',
              value: global.geography.villages || 0,
              percentage: global.geography.percent_villages || 0,
              color: 'bg-teal-500',
            },
          ].filter(item => item.value > 0) : undefined}
        />

        <SummaryCard
          title="Legal Cases"
          value={global?.cases?.total || 0}
          icon={
            <svg
              className="text-gray-800 size-6 dark:text-white/90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          }
          loading={isLoading}
          breakdown={global?.cases ? [
            {
              label: 'Advocacy',
              value: global.cases.advocacy || 0,
              percentage: global.cases.percent_advocacy || 0,
              color: 'bg-indigo-500',
            },
            {
              label: 'Mediation',
              value: global.cases.mediation || 0,
              percentage: global.cases.percent_mediation || 0,
              color: 'bg-cyan-500',
            },
            {
              label: 'Legal Support',
              value: global.cases.legal_support || 0,
              percentage: global.cases.percent_legal_support || 0,
              color: 'bg-violet-500',
            },
            {
              label: 'Other',
              value: global.cases.other || 0,
              percentage: global.cases.percent_other || 0,
              color: 'bg-gray-500',
            },
          ].filter(item => item.value > 0) : undefined}
        />

        <SummaryCard
          title="Project Completion"
          value={metrics ? `${(metrics.projectCompletionRate || 0).toFixed(1)}%` : "0%"}
          icon={
            <svg
              className="text-gray-800 size-6 dark:text-white/90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          subtitle={metrics ? `${metrics.completedProjects}/${metrics.totalProjects} projects` : undefined}
          loading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 md:gap-6">
        <ProjectPerformanceChart
          data={metrics?.topProjects || []}
          loading={isLoading}
        />

        <RegionalDistributionChart
          data={metrics?.topRegions || []}
          loading={isLoading}
        />
      </div>

      {/* Project Details Table */}
      {!isLoading && projects.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Project Details
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Detailed breakdown of all projects
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Project
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Activities
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Beneficiaries
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase dark:text-gray-400">
                    Completion
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {projects.map((project) => {
                  const totalActivities = project.total_activities || 0;
                  const completedActivities = project.completed_activities || 0;
                  const completionRate = totalActivities > 0
                    ? (completedActivities / totalActivities) * 100
                    : 0;
                  const safeCompletionRate = isNaN(completionRate) ? 0 : Math.max(0, Math.min(100, completionRate));

                  return (
                    <tr key={project.project_id || `project-${Math.random()}`}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white/90">
                        {project.title || 'Untitled Project'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : project.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                        }`}>
                          {project.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {completedActivities}/{totalActivities}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                        {(project.total_beneficiaries || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
                            <div
                              className="h-2 rounded-full bg-brand-600"
                              style={{ width: `${safeCompletionRate}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {safeCompletionRate.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && projects.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="mx-auto mb-4 text-6xl">📊</div>
          <h3 className="mb-2 text-lg font-medium text-gray-800 dark:text-white/90">
            No Data Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your filters or refresh the data
          </p>
          <Button
            onClick={handleRefresh}
            className="mt-4"
          >
            Refresh Data
          </Button>
        </div>
      )}
    </div>
  );
}
