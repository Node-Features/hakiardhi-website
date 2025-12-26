"use client";

import type React from "react";
import { createContext, useState, useContext, useCallback } from "react";

export type TimeDimension = "year" | "quarter" | "month" | "all";

export interface FilterState {
  projectId: string;
  startDate: string;
  endDate: string;
  timeDimension: TimeDimension;
  year: string;
  quarter: string;
  month: string;
}

type FilterContextType = {
  filters: FilterState;
  setProjectFilter: (projectId: string) => void;
  setDateFilter: (startDate: string, endDate: string) => void;
  setTimeDimension: (dimension: TimeDimension) => void;
  setYear: (year: string) => void;
  setQuarter: (quarter: string) => void;
  setMonth: (month: string) => void;
  resetFilters: () => void;
  getFilterParams: () => Record<string, string>;
};

const defaultFilters: FilterState = {
  projectId: "all",
  startDate: "",
  endDate: "",
  timeDimension: "all",
  year: "all",
  quarter: "all",
  month: "all",
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const setProjectFilter = useCallback((projectId: string) => {
    setFilters((prev) => ({ ...prev, projectId }));
  }, []);

  const setDateFilter = useCallback((startDate: string, endDate: string) => {
    setFilters((prev) => ({ ...prev, startDate, endDate }));
  }, []);

  const setTimeDimension = useCallback((dimension: TimeDimension) => {
    setFilters((prev) => ({ ...prev, timeDimension: dimension }));
  }, []);

  const setYear = useCallback((year: string) => {
    setFilters((prev) => ({ ...prev, year }));
  }, []);

  const setQuarter = useCallback((quarter: string) => {
    setFilters((prev) => ({ ...prev, quarter }));
  }, []);

  const setMonth = useCallback((month: string) => {
    setFilters((prev) => ({ ...prev, month }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  // Helper function to get filter parameters for API calls
  const getFilterParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};

    if (filters.projectId && filters.projectId !== "all") {
      params.project_id = filters.projectId;
    }

    if (filters.startDate) {
      params.start_date = filters.startDate;
    }

    if (filters.endDate) {
      params.end_date = filters.endDate;
    }

    if (filters.year && filters.year !== "all") {
      params.year = filters.year;
    }

    if (filters.quarter && filters.quarter !== "all") {
      params.quarter = filters.quarter;
    }

    if (filters.month && filters.month !== "all") {
      params.month = filters.month;
    }

    return params;
  }, [filters]);

  return (
    <FilterContext.Provider
      value={{
        filters,
        setProjectFilter,
        setDateFilter,
        setTimeDimension,
        setYear,
        setQuarter,
        setMonth,
        resetFilters,
        getFilterParams,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
};
