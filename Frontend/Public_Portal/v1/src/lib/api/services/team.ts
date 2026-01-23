/**
 * Team Members API Service
 * Service layer for fetching team member data
 */

/**
 * Team member data structure from API
 */
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string | null;
  bio: string | null;
  imageUrl: string | null;
  email: string | null;
  phone: string | null;
  linkedinUrl: string | null;
  twitterUrl: string | null;
  memberType: 'leadership' | 'board' | 'staff' | 'advisor';
  displayOrder: number;
  isActive: boolean;
}

/**
 * API response structure
 */
export interface TeamResponse {
  success: boolean;
  data: {
    leadership: TeamMember[];
    board: TeamMember[];
    staff: TeamMember[];
    advisor: TeamMember[];
  };
}

/**
 * Transform API response to camelCase
 */
function transformTeamMember(member: any): TeamMember {
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    department: member.department,
    bio: member.bio,
    imageUrl: member.image_url,
    email: member.email,
    phone: member.phone,
    linkedinUrl: member.linkedin_url,
    twitterUrl: member.twitter_url,
    memberType: member.member_type,
    displayOrder: member.display_order,
    isActive: member.is_active,
  };
}

/**
 * Fetch all team members grouped by type
 */
export async function fetchTeamMembers(): Promise<TeamResponse['data']> {
  const response = await fetch('/api/team', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch team members');
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch team members');
  }

  // Transform each category
  return {
    leadership: (result.data.leadership || []).map(transformTeamMember),
    board: (result.data.board || []).map(transformTeamMember),
    staff: (result.data.staff || []).map(transformTeamMember),
    advisor: (result.data.advisor || []).map(transformTeamMember),
  };
}

/**
 * Fetch team members by type
 */
export async function fetchTeamByType(type: 'leadership' | 'board' | 'staff' | 'advisor'): Promise<TeamMember[]> {
  const response = await fetch(`/api/team?type=${type}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${type} team members`);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error || `Failed to fetch ${type} team members`);
  }

  return (result.data[type] || []).map(transformTeamMember);
}
