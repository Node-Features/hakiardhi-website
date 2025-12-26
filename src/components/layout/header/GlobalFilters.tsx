"use client";

import React, { useState, useEffect } from "react";
import Select from "@/components/ui/form/Select";
import DatePicker from "@/components/ui/form/date-picker";
import { useFilters, TimeDimension } from "@/context/FilterContext";

// Mock projects data - Replace with actual API call
const mockProjects = [
  { value: "all", label: "All Projects" },
  { value: "1", label: "Land Rights Initiative" },
  { value: "2", label: "Community Development" },
  { value: "3", label: "Environmental Protection" },
];

const timeDimensionOptions = [
  { value: "all", label: "All Time" },
  { value: "year", label: "Year" },
  { value: "quarter", label: "Quarter" },
  { value: "month", label: "Month" },
];

// Generate years (current year and 5 years back)
const currentYear = new Date().getFullYear();
const yearOptions = [
  { value: "all", label: "All Years" },
  ...Array.from({ length: 6 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i),
  })),
];

const quarterOptions = [
  { value: "all", label: "All Quarters" },
  { value: "Q1", label: "Q1 (Jan-Mar)" },
  { value: "Q2", label: "Q2 (Apr-Jun)" },
  { value: "Q3", label: "Q3 (Jul-Sep)" },
  { value: "Q4", label: "Q4 (Oct-Dec)" },
];

const monthOptions = [
  { value: "all", label: "All Months" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const GlobalFilters: React.FC = () => {
  const {
    filters,
    setProjectFilter,
    setDateFilter,
    setTimeDimension,
    setYear,
    setQuarter,
    setMonth,
    resetFilters,
  } = useFilters();

  const [localStartDate, setLocalStartDate] = useState(filters.startDate);
  const [localEndDate, setLocalEndDate] = useState(filters.endDate);

  // Update date filter when both start and end dates are set
  useEffect(() => {
    if (localStartDate && localEndDate) {
      setDateFilter(localStartDate, localEndDate);
    }
  }, [localStartDate, localEndDate, setDateFilter]);

  const handleTimeDimensionChange = (value: string) => {
    setTimeDimension(value as TimeDimension);
    // Reset dependent filters when dimension changes
    if (value === "all") {
      setYear("all");
      setQuarter("all");
      setMonth("all");
    }
  };

  return (
    <div className="w-full px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
      <div className="flex flex-wrap items-center gap-3">
        {/* Project Filter */}
        <div className="flex-1 min-w-[180px] max-w-[250px]">
          <Select
            options={mockProjects}
            placeholder="Select Project"
            onChange={setProjectFilter}
            defaultValue={filters.projectId}
            className="text-xs"
          />
        </div>

        {/* Date Range Filters */}
        <div className="flex items-center gap-2">
          <div className="min-w-[140px]">
            <DatePicker
              id="filter-start-date"
              placeholder="Start Date"
              mode="single"
              onChange={(selectedDates) => {
                if (selectedDates && selectedDates[0]) {
                  const date = selectedDates[0];
                  const formattedDate = date.toISOString().split("T")[0];
                  setLocalStartDate(formattedDate);
                }
              }}
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="min-w-[140px]">
            <DatePicker
              id="filter-end-date"
              placeholder="End Date"
              mode="single"
              onChange={(selectedDates) => {
                if (selectedDates && selectedDates[0]) {
                  const date = selectedDates[0];
                  const formattedDate = date.toISOString().split("T")[0];
                  setLocalEndDate(formattedDate);
                }
              }}
            />
          </div>
        </div>

        {/* Time Dimension Filter */}
        <div className="min-w-[140px] max-w-[160px]">
          <Select
            options={timeDimensionOptions}
            placeholder="Time Period"
            onChange={handleTimeDimensionChange}
            defaultValue={filters.timeDimension}
            className="text-xs"
          />
        </div>

        {/* Conditional filters based on time dimension */}
        {filters.timeDimension === "year" && (
          <div className="min-w-[120px] max-w-[140px]">
            <Select
              options={yearOptions}
              placeholder="Select Year"
              onChange={setYear}
              defaultValue={filters.year}
              className="text-xs"
            />
          </div>
        )}

        {filters.timeDimension === "quarter" && (
          <>
            <div className="min-w-[120px] max-w-[140px]">
              <Select
                options={yearOptions}
                placeholder="Select Year"
                onChange={setYear}
                defaultValue={filters.year}
                className="text-xs"
              />
            </div>
            <div className="min-w-[140px] max-w-[160px]">
              <Select
                options={quarterOptions}
                placeholder="Select Quarter"
                onChange={setQuarter}
                defaultValue={filters.quarter}
                className="text-xs"
              />
            </div>
          </>
        )}

        {filters.timeDimension === "month" && (
          <>
            <div className="min-w-[120px] max-w-[140px]">
              <Select
                options={yearOptions}
                placeholder="Select Year"
                onChange={setYear}
                defaultValue={filters.year}
                className="text-xs"
              />
            </div>
            <div className="min-w-[140px] max-w-[160px]">
              <Select
                options={monthOptions}
                placeholder="Select Month"
                onChange={setMonth}
                defaultValue={filters.month}
                className="text-xs"
              />
            </div>
          </>
        )}

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="px-3 py-2 text-xs font-medium text-gray-700 transition-colors bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default GlobalFilters;
