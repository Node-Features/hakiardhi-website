'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Section from '../ui/Section';
import Grid from '../ui/Grid';
import Card from '../ui/Card';
import { TeamGridSkeleton } from '../ui/TeamMemberSkeleton';
import { fetchTeamMembers, TeamMember } from '@/lib/api/services/team';
import { TYPOGRAPHY, SPACING } from '@/constants/design-tokens';

interface TeamSectionProps {
  showLeadership?: boolean;
  showStaff?: boolean;
  showBoard?: boolean;
  showAdvisors?: boolean;
  className?: string;
}

/**
 * Get safe image URL for Next.js Image component
 */
function getSafeImageUrl(url: string | null): string {
  if (!url) return '/images/placeholder-team.jpg';
  if (url.startsWith('/')) return url;

  const allowedDomains = [
    'hakiardhi-api.vercel.app',
    'tjsatamyfjxdxqgxmcuq.supabase.co',
  ];

  try {
    const urlObj = new URL(url);
    if (allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return url;
    }
  } catch {
    // Invalid URL
  }

  return '/images/placeholder-team.jpg';
}

/**
 * Team Member Card Component
 */
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <Card variant="elevated" hoverEffect="lift" className="overflow-hidden h-full">
      <div className="aspect-square bg-gray-200 relative">
        <Image
          src={getSafeImageUrl(member.imageUrl)}
          alt={member.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <Card.Body>
        <h4 className={`${TYPOGRAPHY.heading.h4.size} ${TYPOGRAPHY.heading.h4.weight} text-gray-900 ${SPACING.margin.element.xs}`}>
          {member.name}
        </h4>
        <p className={`${TYPOGRAPHY.body.default.size} text-gray-600`}>
          {member.role}
        </p>
        {member.department && (
          <p className={`${TYPOGRAPHY.body.sm.size} text-gray-500 mt-1`}>
            {member.department}
          </p>
        )}
      </Card.Body>
    </Card>
  );
}

export default function TeamSection({
  showLeadership = true,
  showStaff = true,
  showBoard = false,
  showAdvisors = false,
  className = '',
}: TeamSectionProps) {
  const [teamData, setTeamData] = useState<{
    leadership: TeamMember[];
    board: TeamMember[];
    staff: TeamMember[];
    advisor: TeamMember[];
  }>({
    leadership: [],
    board: [],
    staff: [],
    advisor: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTeam() {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchTeamMembers();
        setTeamData(data);
      } catch (err) {
        console.error('Failed to load team members:', err);
        setError('Failed to load team members');
      } finally {
        setIsLoading(false);
      }
    }

    loadTeam();
  }, []);

  return (
    <Section variant="white" spacing="lg" className={className}>
      <Section.Content>
        <div className="text-center mb-12">
          <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-hakiardhi-red ${SPACING.margin.element.md}`}>
            Our Team
          </h2>
          <p className={`${TYPOGRAPHY.body.lg.size} text-gray-600 max-w-3xl mx-auto`}>
            Dedicated professionals committed to advancing land rights in Tanzania
          </p>
        </div>

        {error && (
          <div className="text-center py-8">
            <p className="text-gray-500">{error}</p>
          </div>
        )}

        {/* Leadership Section */}
        {showLeadership && (
          <div className={SPACING.margin.element.xl}>
            <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 ${SPACING.margin.element.lg}`}>
              Leadership
            </h3>
            {isLoading ? (
              <TeamGridSkeleton count={3} />
            ) : teamData.leadership.length > 0 ? (
              <Grid layout="thirds">
                {teamData.leadership.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </Grid>
            ) : (
              <p className="text-gray-500 text-center py-4">No leadership team members available.</p>
            )}
          </div>
        )}

        {/* Staff Section */}
        {showStaff && (
          <div className={SPACING.margin.element.xl}>
            <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 ${SPACING.margin.element.lg}`}>
              Staff
            </h3>
            {isLoading ? (
              <TeamGridSkeleton count={6} />
            ) : teamData.staff.length > 0 ? (
              <Grid layout="thirds">
                {teamData.staff.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </Grid>
            ) : (
              <p className="text-gray-500 text-center py-4">No staff members available.</p>
            )}
          </div>
        )}

        {/* Advisors Section */}
        {showAdvisors && (
          <div className={SPACING.margin.element.xl}>
            <h3 className={`${TYPOGRAPHY.heading.h3.size} ${TYPOGRAPHY.heading.h3.weight} text-gray-900 ${SPACING.margin.element.lg}`}>
              Advisors
            </h3>
            {isLoading ? (
              <TeamGridSkeleton count={2} />
            ) : teamData.advisor.length > 0 ? (
              <Grid layout="thirds">
                {teamData.advisor.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </Grid>
            ) : (
              <p className="text-gray-500 text-center py-4">No advisors available.</p>
            )}
          </div>
        )}
      </Section.Content>
    </Section>
  );
}

/**
 * Board of Directors Section - Separate component for dedicated display
 */
export function BoardSection({ className = '' }: { className?: string }) {
  const [boardMembers, setBoardMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadBoard() {
      try {
        setIsLoading(true);
        const data = await fetchTeamMembers();
        setBoardMembers(data.board);
      } catch (err) {
        console.error('Failed to load board members:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBoard();
  }, []);

  return (
    <Section variant="white" spacing="lg" className={className}>
      <Section.Content>
        <h2 className={`${TYPOGRAPHY.heading.h2.size} ${TYPOGRAPHY.heading.h2.weight} text-hakiardhi-red ${SPACING.margin.element.lg} text-center`}>
          Board of Directors
        </h2>
        <p className={`${TYPOGRAPHY.body.lg.size} text-gray-700 ${TYPOGRAPHY.body.lg.lineHeight} text-center ${SPACING.margin.element.xl} max-w-3xl mx-auto`}>
          Our Board provides strategic governance and brings diverse expertise in land rights,
          law, development, and community advocacy.
        </p>

        {isLoading ? (
          <TeamGridSkeleton count={6} />
        ) : boardMembers.length > 0 ? (
          <Grid layout="thirds">
            {boardMembers.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </Grid>
        ) : (
          <p className="text-gray-500 text-center py-8">No board members available.</p>
        )}
      </Section.Content>
    </Section>
  );
}
