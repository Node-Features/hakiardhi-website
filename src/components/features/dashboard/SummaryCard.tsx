"use client";

import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@/icons";

export interface BreakdownItem {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface SummaryCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  loading?: boolean;
  breakdown?: BreakdownItem[];
}

const defaultColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
];

// Helper function to safely format percentages
const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.0';
  }
  return value.toFixed(1);
};

// Helper function to get safe percentage value for width
const getSafePercentage = (value: number | undefined | null): number => {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, value)); // Clamp between 0-100
};

export default function SummaryCard({
  title,
  value,
  icon,
  trend,
  subtitle,
  loading = false,
  breakdown,
}: SummaryCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 animate-pulse">
        <div className="w-12 h-12 bg-gray-200 rounded-xl dark:bg-gray-800" />
        <div className="mt-5 space-y-2">
          <div className="w-20 h-4 bg-gray-200 rounded dark:bg-gray-800" />
          <div className="w-24 h-8 bg-gray-200 rounded dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 hover:shadow-md transition-shadow">
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          {icon}
        </div>
      )}

      <div className="flex items-end justify-between mt-5">
        <div className="flex-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {title}
          </span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-md dark:text-white/90">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h4>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {subtitle}
            </p>
          )}
        </div>

        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trend.isPositive
              ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            {trend.isPositive ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {/* Breakdown Section */}
      {breakdown && breakdown.length > 0 && (
        <div className="pt-4 mt-4 space-y-2 border-t border-gray-100 dark:border-gray-800">
          {breakdown.map((item, index) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400 capitalize">
                  {item.label}
                </span>
                <span className="font-medium text-gray-800 dark:text-white/90">
                  {(item.value || 0).toLocaleString()} ({formatPercentage(item.percentage)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full dark:bg-gray-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    item.color || defaultColors[index % defaultColors.length]
                  }`}
                  style={{ width: `${getSafePercentage(item.percentage)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
