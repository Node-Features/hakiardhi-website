import useSWR from 'swr';
import { authApiFetch } from '@/lib/api/interceptors';

export interface RegionInfo {
  id: string;
  name: string;
}

export interface ProjectWithRegions {
  project_id: string;
  project_name: string;
  regions: RegionInfo[];
}

export interface ProjectsByRegionResponse {
  success: boolean;
  data: ProjectWithRegions[];
  count: number;
}

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * Fetcher function for SWR using authenticated API client with token refresh
 */
const fetcher = (url: string): Promise<ProjectsByRegionResponse> =>
  authApiFetch<ProjectsByRegionResponse>(url);

/**
 * Hook to fetch projects with their regions and transform to filter options
 */
export function useProjectsAndRegions() {
  const { data, error, isLoading, mutate } = useSWR<ProjectsByRegionResponse>(
    '/api/admin/regions/projects_by_region',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Transform projects to select options
  const projectOptions: SelectOption[] = data?.data
    ? [
        { value: 'all', label: 'All Projects' },
        ...data.data.map((project) => ({
          value: project.project_id,
          label: project.project_name,
        })),
      ]
    : [{ value: 'all', label: 'All Projects' }];

  // Extract unique regions from all projects and transform to select options
  const regionOptions: SelectOption[] = (() => {
    if (!data?.data) {
      return [{ value: 'all', label: 'All Regions' }];
    }

    const uniqueRegions = new Map<string, string>();

    data.data.forEach((project) => {
      project.regions.forEach((region) => {
        // Trim whitespace from region names
        const cleanName = region.name.trim();
        if (!uniqueRegions.has(region.id)) {
          uniqueRegions.set(region.id, cleanName);
        }
      });
    });

    return [
      { value: 'all', label: 'All Regions' },
      ...Array.from(uniqueRegions.entries())
        .map(([id, name]) => ({
          value: id,
          label: name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    ];
  })();

  return {
    projects: data?.data || [],
    projectOptions,
    regionOptions,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}
