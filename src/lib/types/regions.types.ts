// Region and Project types for regions API

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
