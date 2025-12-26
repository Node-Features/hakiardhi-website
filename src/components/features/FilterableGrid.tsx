'use client';

/**
 * FilterableGrid Component
 *
 * Reusable filterable grid pattern with category filters
 * Replaces custom filtering logic in ProgramsGallerySection
 */

import { useState, ReactNode } from 'react';
import Grid, { GridProps } from '../ui/Grid';
import { SPACING } from '@/constants/design-tokens';

export interface FilterableGridProps<T> {
  items: T[];
  categories: string[];
  filterKey: keyof T;
  renderItem: (item: T, index: number) => ReactNode;
  emptyState?: ReactNode;
  grid?: Omit<GridProps, 'children'>;
  className?: string;
}

export default function FilterableGrid<T extends Record<string, any>>({
  items,
  categories,
  filterKey,
  renderItem,
  emptyState,
  grid = { cols: { base: 1, md: 2, lg: 3 }, gap: 'lg' },
  className = '',
}: FilterableGridProps<T>) {
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'All');

  const filteredItems =
    selectedCategory === 'All'
      ? items
      : items.filter((item) => item[filterKey] === selectedCategory);

  return (
    <div className={className}>
      {/* Category Filter */}
      <div className={`flex flex-wrap justify-center ${SPACING.gap.sm} ${SPACING.margin.section.sm}`}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 ${
              selectedCategory === category
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/50 scale-105'
                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700 hover:scale-105'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <Grid {...grid}>{filteredItems.map((item, index) => renderItem(item, index))}</Grid>
      ) : (
        emptyState || (
          <div className={`text-center ${SPACING.section.sm}`}>
            <p className="text-gray-400 text-lg">No items found in this category.</p>
          </div>
        )
      )}
    </div>
  );
}
