/**
 * Team Members Endpoint
 * GET /api/public/about/team
 *
 * Returns team members from users table organized by member_type
 */

import { NextRequest } from 'next/server';
import { supabase } from '@/lib/database/supabase_client';
import { apiResponse, errorResponse } from '@/lib/portal/helpers';

const db = supabase(false);

// Fallback: Map role names to member types (used when member_type is not set)
const ROLE_TO_MEMBER_TYPE: Record<string, 'leadership' | 'board' | 'staff' | 'advisor'> = {
  'executive_director': 'leadership',
  'director': 'leadership',
  'ceo': 'leadership',
  'admin': 'leadership',
  'board_member': 'board',
  'board_chair': 'board',
  'legal_advisor': 'advisor',
  'advisor': 'advisor',
};

// Fallback: Map role names to display titles (used when user has no custom role set)
const ROLE_DISPLAY_NAMES: Record<string, string> = {
  'executive_director': 'Executive Director',
  'director': 'Director',
  'ceo': 'Chief Executive Officer',
  'admin': 'Administrator',
  'board_member': 'Board Member',
  'board_chair': 'Board Chair',
  'legal_advisor': 'Legal Advisor',
  'advisor': 'Advisor',
  'staff': 'Staff Member',
  'program_officer': 'Program Officer',
  'field_officer': 'Field Officer',
  'communications': 'Communications Officer',
  'finance': 'Finance Officer',
};

function getMemberType(memberType: string | null, roleName: string): 'leadership' | 'board' | 'staff' | 'advisor' {
  // Use explicit member_type if set
  if (memberType && ['leadership', 'board', 'staff', 'advisor'].includes(memberType)) {
    return memberType as 'leadership' | 'board' | 'staff' | 'advisor';
  }
  // Fallback to role-based mapping
  return ROLE_TO_MEMBER_TYPE[roleName?.toLowerCase()] || 'staff';
}

function getRoleDisplayName(roleName: string): string {
  return ROLE_DISPLAY_NAMES[roleName?.toLowerCase()] ||
    roleName?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) ||
    'Team Member';
}

export async function GET(request: NextRequest) {
  try {
    // Fetch users with their roles - only those marked to show in team
    const { data: users, error } = await db
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone_number,
        image_url,
        status,
        department,
        bio,
        linkedin_url,
        twitter_url,
        member_type,
        display_order,
        show_in_team,
        user_roles (
          roles (
            id,
            name
          )
        )
      `)
      .eq('status', 'Active')
      .eq('show_in_team', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('first_name', { ascending: true });

    if (error) throw error;

    // Transform users to team member format
    const teamMembers = (users || []).map((user: any, index: number) => {
      const roleName = user.user_roles?.[0]?.roles?.[0]?.name || 'staff';
      const memberType = getMemberType(user.member_type, roleName);

      return {
        id: user.id,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        role: getRoleDisplayName(roleName),
        department: user.department,
        bio: user.bio,
        image_url: user.image_url,
        email: user.email,
        phone: user.phone_number,
        linkedin_url: user.linkedin_url,
        twitter_url: user.twitter_url,
        member_type: memberType,
        display_order: user.display_order ?? index,
        is_active: user.status === 'Active',
      };
    });

    // Organize by member type
    const organized = {
      leadership: teamMembers.filter((m) => m.member_type === 'leadership'),
      board: teamMembers.filter((m) => m.member_type === 'board'),
      staff: teamMembers.filter((m) => m.member_type === 'staff'),
      advisor: teamMembers.filter((m) => m.member_type === 'advisor'),
    };

    return apiResponse(organized);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return errorResponse('Failed to fetch team members', 'TEAM_ERROR', 500);
  }
}
