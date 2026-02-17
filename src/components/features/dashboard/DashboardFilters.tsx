"use client";

import React, { useState, useEffect, useMemo } from "react";
import Select from "@/components/ui/form/Select";
import DatePicker from "@/components/ui/form/date-picker";
import { useProjectsAndRegions } from "@/hooks/useProjectsAndRegions";

export type IntervalType = "month" | "quarter" | "year" | "date";

export interface DashboardFiltersProps {
  onFilterChange: (filters: {
    project_uuid: string | null;
    region_uuid: string | null;
    interval_type: IntervalType;
    year?: number;
    quarter?: number;
    month?: number;
    start_date?: string;
    end_date?: string;
  }) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const intervalOptions = [
  { value: "month", label: "Monthly" },
  { value: "quarter", label: "Quarterly" },
  { value: "year", label: "Yearly" },
  { value: "date", label: "Custom Date Range" },
];

// Year options: 2020-2030
const yearOptions = Array.from({ length: 11 }, (_, i) => ({
  value: String(2020 + i),
  label: String(2020 + i),
}));

// Quarter options: Q1-Q4
const quarterOptions = [
  { value: "1", label: "Q1 (Jan-Mar)" },
  { value: "2", label: "Q2 (Apr-Jun)" },
  { value: "3", label: "Q3 (Jul-Sep)" },
  { value: "4", label: "Q4 (Oct-Dec)" },
];

// Month options: January-December
const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function DashboardFilters({
  onFilterChange,
  onRefresh,
  loading = false,
}: DashboardFiltersProps) {
  // Fetch real projects and regions data
  const { projects, projectOptions, regionOptions, isLoading: dataLoading } = useProjectsAndRegions();

  const [projectId, setProjectId] = useState<string>("all");
  const [regionId, setRegionId] = useState<string>("all");
  const [intervalType, setIntervalType] = useState<IntervalType>("year");
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [selectedQuarter, setSelectedQuarter] = useState<string>("1");
  const [selectedMonth, setSelectedMonth] = useState<string>("1");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Filter regions based on selected project
  const filteredRegionOptions = useMemo(() => {
    if (projectId === "all") {
      // Show all regions when "All Projects" is selected
      return regionOptions;
    }

    // Find the selected project
    const selectedProject = projects.find((p) => p.project_id === projectId);

    if (!selectedProject || selectedProject.regions.length === 0) {
      // If project has no regions, show "All Regions" only
      return [{ value: "all", label: "All Regions" }];
    }

    // Show only regions associated with the selected project
    return [
      { value: "all", label: "All Regions" },
      ...selectedProject.regions
        .map((region) => ({
          value: region.id,
          label: region.name.trim(),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  }, [projectId, projects, regionOptions]);

  // Reset region selection when project changes
  useEffect(() => {
    setRegionId("all");
  }, [projectId]);

  // Reset time-specific selections when interval type changes
  useEffect(() => {
    setSelectedYear(String(new Date().getFullYear()));
    setSelectedQuarter("1");
    setSelectedMonth("1");
    setStartDate("");
    setEndDate("");
  }, [intervalType]);

  useEffect(() => {
    onFilterChange({
      project_uuid: projectId === "all" ? null : projectId,
      region_uuid: regionId === "all" ? null : regionId,
      interval_type: intervalType,
      year: intervalType === "year" ? Number(selectedYear) : undefined,
      quarter: intervalType === "quarter" ? Number(selectedQuarter) : undefined,
      month: intervalType === "month" ? Number(selectedMonth) : undefined,
      start_date: intervalType === "date" ? startDate : undefined,
      end_date: intervalType === "date" ? endDate : undefined,
    });
  }, [projectId, regionId, intervalType, selectedYear, selectedQuarter, selectedMonth, startDate, endDate, onFilterChange]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
          Dashboard Filters
        </h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn-icon-primary disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Project Filter */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Project
          </label>
          <Select
            options={projectOptions}
            placeholder={dataLoading ? "Loading projects..." : "Select Project"}
            onChange={setProjectId}
            defaultValue={projectId}
          />
        </div>

        {/* Region Filter - Filtered based on selected project */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Region
          </label>
          <Select
            options={filteredRegionOptions}
            placeholder={dataLoading ? "Loading regions..." : "Select Region"}
            onChange={setRegionId}
            defaultValue={regionId}
            key={projectId} // Force re-render when project changes
          />
        </div>

        {/* Time Interval Filter */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Time Period
          </label>
          <Select
            options={intervalOptions}
            placeholder="Select Interval"
            onChange={(value) => setIntervalType(value as IntervalType)}
            defaultValue={intervalType}
          />
        </div>

        {/* Year Selection (shown when year is selected) */}
        {intervalType === "year" && (
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Year
            </label>
            <Select
              options={yearOptions}
              placeholder="Select Year"
              onChange={setSelectedYear}
              defaultValue={selectedYear}
            />
          </div>
        )}

        {/* Quarter Selection (shown when quarter is selected) */}
        {intervalType === "quarter" && (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Year
              </label>
              <Select
                options={yearOptions}
                placeholder="Select Year"
                onChange={setSelectedYear}
                defaultValue={selectedYear}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Quarter
              </label>
              <Select
                options={quarterOptions}
                placeholder="Select Quarter"
                onChange={setSelectedQuarter}
                defaultValue={selectedQuarter}
              />
            </div>
          </>
        )}

        {/* Month Selection (shown when month is selected) */}
        {intervalType === "month" && (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Year
              </label>
              <Select
                options={yearOptions}
                placeholder="Select Year"
                onChange={setSelectedYear}
                defaultValue={selectedYear}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Month
              </label>
              <Select
                options={monthOptions}
                placeholder="Select Month"
                onChange={setSelectedMonth}
                defaultValue={selectedMonth}
              />
            </div>
          </>
        )}

        {/* Custom Date Range (shown when date is selected) */}
        {intervalType === "date" && (
          <>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <DatePicker
                id="dashboard-start-date"
                mode="single"
                onChange={(dates) => {
                  if (dates && dates[0]) {
                    setStartDate(dates[0].toISOString().split('T')[0]);
                  }
                }}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                End Date
              </label>
              <DatePicker
                id="dashboard-end-date"
                mode="single"
                onChange={(dates) => {
                  if (dates && dates[0]) {
                    setEndDate(dates[0].toISOString().split('T')[0]);
                  }
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
