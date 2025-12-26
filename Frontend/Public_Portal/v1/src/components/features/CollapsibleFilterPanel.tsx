'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  iconName?: string;
  type: 'select' | 'buttons';
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  conditional?: boolean; // Only show if certain conditions are met
}

export interface CollapsibleFilterPanelProps {
  filters: FilterConfig[];
  resultCount: number;
  resultLabel?: string;
  onClearAll?: () => void;
  defaultOpen?: boolean;
}

export default function CollapsibleFilterPanel({
  filters,
  resultCount,
  resultLabel = 'results',
  onClearAll,
  defaultOpen = false,
}: CollapsibleFilterPanelProps) {
  const [showFilters, setShowFilters] = useState(defaultOpen);

  // Check if any filters are active (not on default "All" value)
  const hasActiveFilters = filters.some(filter => filter.value !== 'All');

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-200">
      <div className="hakiardhi-container py-6">
        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="group flex items-center gap-2 px-6 py-3 bg-white rounded-xl border-2 border-gray-200 hover:border-hakiardhi-red transition-all duration-300 shadow-sm hover:shadow-md"
          >
            <Icon name="funnel" size="sm" className="text-hakiardhi-red" />
            <span className="font-semibold text-gray-900">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 bg-hakiardhi-red text-white text-xs font-bold rounded-full">
                Active
              </span>
            )}
            <Icon
              name={showFilters ? "chevron-up" : "chevron-down"}
              size="sm"
              className="text-gray-400 group-hover:text-hakiardhi-red transition-colors"
            />
          </button>

          {hasActiveFilters && onClearAll && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-2 px-4 py-2 text-hakiardhi-red hover:bg-hakiardhi-red/5 rounded-lg font-medium transition-all duration-300"
            >
              <Icon name="close" size="sm" />
              Clear Filters
            </button>
          )}
        </div>

        {/* Filter Panel with Slide Animation */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filters.map((filter) => {
                // Skip conditional filters if condition is false
                if (filter.conditional === false) return null;

                return (
                  <div key={filter.id} className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                      {filter.iconName && (
                        <Icon name={filter.iconName as any} size="sm" className="text-hakiardhi-red" />
                      )}
                      {filter.label}
                    </label>

                    {filter.type === 'select' ? (
                      // Select dropdown
                      <select
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-900 font-medium hover:border-hakiardhi-red focus:border-hakiardhi-red focus:ring-4 focus:ring-hakiardhi-red/10 transition-all cursor-pointer"
                      >
                        {filter.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      // Button group
                      <div className="flex flex-wrap gap-2">
                        {filter.options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => filter.onChange(option.value)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                              filter.value === option.value
                                ? 'bg-hakiardhi-red text-white shadow-md scale-105'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Results Count Badge */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-2">
                <Icon name="check-circle" size="sm" className="text-hakiardhi-red" />
                <span className="text-gray-600 font-medium">
                  Showing <span className="text-hakiardhi-red font-bold text-lg">{resultCount}</span>{' '}
                  {resultCount === 1 ? resultLabel.replace(/s$/, '') : resultLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
