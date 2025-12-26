# Dashboard Components

Reusable components for the HakiArdhi Analytics Dashboard.

## Components

### SummaryCard

Displays a metric with optional icon, trend, and subtitle.

**Usage:**
```tsx
import SummaryCard from '@/components/features/dashboard/SummaryCard';

// Basic usage
<SummaryCard
  title="Total Projects"
  value={150}
  icon={<ProjectIcon />}
  trend={{ value: 12.5, isPositive: true }}
  subtitle="50 active"
  loading={false}
/>

// With breakdown data
<SummaryCard
  title="Total Beneficiaries"
  value={1250}
  icon={<GroupIcon />}
  breakdown={[
    { label: 'Male', value: 750, percentage: 60, color: 'bg-blue-500' },
    { label: 'Female', value: 450, percentage: 36, color: 'bg-pink-500' },
    { label: 'Other', value: 50, percentage: 4, color: 'bg-purple-500' },
  ]}
  loading={false}
/>
```

**Props:**
- `title` (string) - Card title
- `value` (number | string) - Main metric value
- `icon` (ReactNode) - Optional icon to display
- `trend` (object) - Optional trend data with value and direction
- `subtitle` (string) - Optional subtitle text
- `loading` (boolean) - Show loading skeleton
- `breakdown` (array) - Optional breakdown data showing disaggregated statistics with progress bars

**Breakdown Item Structure:**
```typescript
{
  label: string;        // Category label (e.g., "Male", "Female")
  value: number;        // Absolute value
  percentage: number;   // Percentage value
  color?: string;       // Optional Tailwind color class (e.g., "bg-blue-500")
}
```

### DashboardFilters

Advanced filter bar with conditional dropdowns for project, region, and time controls. Automatically fetches and displays real projects and regions from the API with intelligent filtering.

**Usage:**
```tsx
import DashboardFilters from '@/components/features/dashboard/DashboardFilters';

<DashboardFilters
  onFilterChange={(filters) => console.log(filters)}
  onRefresh={() => refetch()}
  loading={isLoading}
/>
```

**Props:**
- `onFilterChange` (function) - Callback when filters change
- `onRefresh` (function) - Optional callback for refresh button
- `loading` (boolean) - Disable refresh button when loading

**Filter Object:**
```typescript
{
  project_uuid: string | null,
  region_uuid: string | null,
  interval_type: 'month' | 'quarter' | 'year' | 'date',
  year?: number,           // Available when interval_type is 'year', 'quarter', or 'month'
  quarter?: number,        // Available when interval_type is 'quarter' (1-4)
  month?: number,          // Available when interval_type is 'month' (1-12)
  start_date?: string,     // Available when interval_type is 'date'
  end_date?: string        // Available when interval_type is 'date'
}
```

**Conditional Filter Behavior:**

1. **Region Filtering:**
   - When "All Projects" is selected: Shows all available regions
   - When a specific project is selected: Shows only regions associated with that project
   - Automatically resets to "All Regions" when project selection changes

2. **Time Period Filters:**
   - **Year**: Shows year dropdown (2020-2030)
   - **Quarter**: Shows year dropdown + quarter dropdown (Q1-Q4 with month labels)
   - **Month**: Shows year dropdown + month dropdown (January-December)
   - **Custom Date Range**: Shows start date and end date pickers
   - All selections reset when interval type changes

**Time Period Options:**

- **Years**: 2020, 2021, 2022, ..., 2030
- **Quarters**:
  - Q1 (Jan-Mar)
  - Q2 (Apr-Jun)
  - Q3 (Jul-Sep)
  - Q4 (Oct-Dec)
- **Months**: January, February, March, ..., December

**Data Source:**
- Projects: Fetched from `/api/admin/regions/projects_by_region`
- Regions: Extracted from project-region relationships and filtered dynamically
- Uses `useProjectsAndRegions` hook with SWR for caching (60-second deduplication)

**API Integration Examples:**

The filters generate different query strings based on the interval type selected:

```typescript
// Yearly filter
GET /api/admin/analytics/overview?interval_type=year&year=2025

// Quarterly filter
GET /api/admin/analytics/overview?interval_type=quarter&year=2025&quarter=2

// Monthly filter
GET /api/admin/analytics/overview?interval_type=month&year=2025&month=6

// Custom date range filter
GET /api/admin/analytics/overview?interval_type=date&start_date=2025-01-01&end_date=2025-12-31

// With project and region filters
GET /api/admin/analytics/overview?project_uuid=abc123&region_uuid=xyz789&interval_type=year&year=2025
```

**Complete Usage Example:**

```tsx
import DashboardFilters from '@/components/features/dashboard/DashboardFilters';
import { useDashboardData } from '@/hooks/useDashboardData';

function Dashboard() {
  const [filters, setFilters] = useState({
    project_uuid: null,
    region_uuid: null,
    interval_type: 'year' as const,
  });

  const { data, isLoading, refresh } = useDashboardData(filters);

  return (
    <>
      <DashboardFilters
        onFilterChange={setFilters}
        onRefresh={refresh}
        loading={isLoading}
      />
      {/* Dashboard content */}
    </>
  );
}
```

### ProjectPerformanceChart

Horizontal bar chart showing project completion rates.

**Usage:**
```tsx
import ProjectPerformanceChart from '@/components/features/dashboard/ProjectPerformanceChart';

<ProjectPerformanceChart
  data={[
    {
      project_id: '123',
      title: 'Land Rights Project',
      total_activities: 50,
      completed_activities: 35
    }
  ]}
  loading={false}
/>
```

**Props:**
- `data` (array) - Array of project performance objects
- `loading` (boolean) - Show loading state

### RegionalDistributionChart

Grouped bar chart showing regional statistics.

**Usage:**
```tsx
import RegionalDistributionChart from '@/components/features/dashboard/RegionalDistributionChart';

<RegionalDistributionChart
  data={[
    {
      region_id: '456',
      region_name: 'Dar es Salaam',
      beneficiaries: 1200,
      incidents: 45,
      cases: 22,
      projects: 8
    }
  ]}
  loading={false}
/>
```

**Props:**
- `data` (array) - Array of regional data objects
- `loading` (boolean) - Show loading state

## Common Patterns

### Loading States

All components support loading states:

```tsx
<SummaryCard loading={true} {...props} />
<ProjectPerformanceChart loading={true} {...props} />
<RegionalDistributionChart loading={true} {...props} />
```

### Empty States

Charts automatically show empty states when data is empty:

```tsx
<ProjectPerformanceChart data={[]} />
// Shows: "No project data available"
```

### Error Handling

Handle errors at the page level:

```tsx
if (error) {
  return <ErrorMessage />;
}

return <DashboardComponents />;
```

## Styling

All components use Tailwind CSS and support dark mode:

```tsx
// Automatically adapts to dark mode
className="bg-white dark:bg-gray-900"
```

## Performance

### Chart Optimization

Charts use dynamic imports to reduce initial bundle size:

```tsx
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
```

### Memoization

Consider memoizing expensive calculations:

```tsx
const chartData = useMemo(() =>
  processData(rawData),
  [rawData]
);
```

## Extending

### Adding New Metrics

1. Create new SummaryCard instance
2. Map data from API response
3. Add icon and styling

### Adding New Charts

1. Create new component file
2. Follow existing chart pattern
3. Accept `data` and `loading` props
4. Handle empty/loading states
5. Use ApexCharts for consistency

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import SummaryCard from './SummaryCard';

test('renders metric value', () => {
  render(<SummaryCard title="Test" value={100} />);
  expect(screen.getByText('100')).toBeInTheDocument();
});
```

### Visual Regression

Use Storybook or Chromatic for visual testing.

## Dependencies

- react-apexcharts - Chart library
- @/components/ui/form/Select - Dropdown component
- @/components/ui/form/date-picker - Date picker component
- @/components/layout/common/ComponentCard - Card wrapper
- @/icons - Icon components

## Best Practices

1. **Props validation** - Use TypeScript interfaces
2. **Loading states** - Always provide loading UI
3. **Empty states** - Handle no data gracefully
4. **Accessibility** - Include ARIA labels
5. **Responsive** - Test on mobile devices
6. **Dark mode** - Use dark: variants
7. **Performance** - Memoize expensive operations
8. **Reusability** - Keep components generic

## Troubleshooting

### Charts not rendering
- Check ApexCharts is installed
- Verify data format matches expected interface
- Ensure dynamic import is used

### Filters not working
- Verify onFilterChange callback is provided
- Check filter state is being updated
- Ensure API receives correct parameters

### Loading states stuck
- Check isLoading flag is updated correctly
- Verify SWR hook is configured properly
- Check for JavaScript errors in console
