import { supabase } from '../database/supabase_client';
import { LegalAidFilters } from '../types/legal-aid.types';

const db = supabase(true);

export class LegalAidService {
  /**
   * Generate unique case number (HAK-YYYY-NNNN)
   */
  async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();

    // Get count of requests this year
    const { count } = await db
      .from('legal_aid_requests')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${year}-01-01`)
      .lte('created_at', `${year}-12-31`);

    const nextNumber = (count || 0) + 1;
    return `HAK-${year}-${String(nextNumber).padStart(4, '0')}`;
  }

  /**
   * Calculate priority based on case details
   */
  calculatePriority(caseDetails: any): string {
    let score = 0;

    // Has active court case
    if (caseDetails.has_active_court_case) score += 3;

    // Next court date is soon (within 30 days)
    if (caseDetails.next_court_date) {
      const daysUntilCourt = Math.floor(
        (new Date(caseDetails.next_court_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilCourt <= 30) score += 2;
      if (daysUntilCourt <= 7) score += 2;
    }

    // Urgency level from beneficiary
    if (caseDetails.urgency_level === 'Urgent') score += 3;
    if (caseDetails.urgency_level === 'High') score += 2;

    // Case type - eviction is high priority
    if (caseDetails.case_type === 'Eviction') score += 2;

    // Determine final priority
    if (score >= 7) return 'Urgent';
    if (score >= 5) return 'High';
    if (score >= 3) return 'Medium';
    return 'Low';
  }

  /**
   * Get queue position for new request
   */
  async getQueuePosition(): Promise<number> {
    const { count } = await db
      .from('legal_aid_requests')
      .select('id', { count: 'exact', head: true })
      .eq('current_stage', 'Queued for Assignment');

    return (count || 0) + 1;
  }

  /**
   * Find best lawyer for assignment based on workload and specialization
   */
  async findBestLawyer(caseType: string): Promise<string | null> {
    // Get all lawyers with their workloads
    const { data: lawyers } = await db
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        roles!inner(name)
      `)
      .eq('roles.name', 'legal_advisor')
      .eq('status', 'Active');

    if (!lawyers || lawyers.length === 0) return null;

    // Calculate workload for each lawyer
    const lawyersWithWorkload = await Promise.all(
      lawyers.map(async (lawyer) => {
        const { count } = await db
          .from('legal_aid_requests')
          .select('id', { count: 'exact', head: true })
          .eq('assigned_lawyer_id', lawyer.id)
          .not('current_stage', 'in', '("Completed - Documents Provided","Completed - Case Resolved","Completed - Referred to Litigation","Completed - Withdrawn","Closed - Unable to Assist")');

        return {
          id: lawyer.id,
          active_cases: count || 0,
        };
      })
    );

    // Find lawyer with lowest workload
    const bestLawyer = lawyersWithWorkload.reduce((prev, current) =>
      prev.active_cases < current.active_cases ? prev : current
    );

    return bestLawyer.id;
  }

  /**
   * Update stage and create history entry
   */
  async updateStage(requestId: string, newStage: string, notes?: string): Promise<void> {
    // Get current stage
    const { data: request } = await db
      .from('legal_aid_requests')
      .select('current_stage')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Request not found');

    const now = new Date();

    // Close current stage in history
    await db
      .from('stage_history')
      .update({
        current: false,
        exited_at: now,
      })
      .eq('request_id', requestId)
      .eq('current', true);

    // Create new stage history entry
    await db
      .from('stage_history')
      .insert({
        request_id: requestId,
        stage: newStage,
        entered_at: now,
        current: true,
        notes,
      });

    // Update request current stage
    await db
      .from('legal_aid_requests')
      .update({ current_stage: newStage, updated_at: now })
      .eq('id', requestId);
  }

  /**
   * Get statistics
   */
  async getStatistics(filters?: LegalAidFilters): Promise<any> {
    let query = db.from('legal_aid_requests').select('*');

    // Apply filters
    if (filters?.region_id) query = query.eq('demographic_details->>region_id', filters.region_id);
    if (filters?.district_id) query = query.eq('demographic_details->>district_id', filters.district_id);
    if (filters?.date_from) query = query.gte('created_at', filters.date_from);
    if (filters?.date_to) query = query.lte('created_at', filters.date_to);

    const { data: requests, error } = await query;

    if (error) throw error;

    // Calculate statistics
    const stats = {
      total_requests: requests?.length || 0,
      by_stage: {} as Record<string, number>,
      by_case_type: {} as Record<string, number>,
      by_priority: {} as Record<string, number>,
      by_region: {} as Record<string, number>,
      success_metrics: {
        documents_provided_count: 0,
        cases_resolved_through_mediation: 0,
        referred_to_litigation: 0,
        average_days_to_completion: 0,
      },
      demographics: {
        by_gender: {} as Record<string, number>,
        by_age_group: {} as Record<string, number>,
        by_income_level: {} as Record<string, number>,
        persons_with_disabilities: 0,
      },
    };

    requests?.forEach((req) => {
      // By stage
      stats.by_stage[req.current_stage] = (stats.by_stage[req.current_stage] || 0) + 1;

      // By case type
      const caseType = req.case_details.case_type;
      stats.by_case_type[caseType] = (stats.by_case_type[caseType] || 0) + 1;

      // By priority
      stats.by_priority[req.priority] = (stats.by_priority[req.priority] || 0) + 1;

      // Success metrics
      if (req.current_stage === 'Completed - Documents Provided') {
        stats.success_metrics.documents_provided_count++;
      }
      if (req.current_stage === 'Completed - Case Resolved') {
        stats.success_metrics.cases_resolved_through_mediation++;
      }
      if (req.current_stage === 'Completed - Referred to Litigation') {
        stats.success_metrics.referred_to_litigation++;
      }

      // Demographics
      const gender = req.beneficiary_details.gender;
      stats.demographics.by_gender[gender] = (stats.demographics.by_gender[gender] || 0) + 1;

      const income = req.beneficiary_details.income_level;
      stats.demographics.by_income_level[income] = (stats.demographics.by_income_level[income] || 0) + 1;

      if (req.beneficiary_details.disability_status !== 'None') {
        stats.demographics.persons_with_disabilities++;
      }

      // Age groups
      const age = req.beneficiary_details.age;
      const ageGroup = age < 18 ? 'Under 18' : age < 35 ? '18-34' : age < 50 ? '35-49' : age < 65 ? '50-64' : '65+';
      stats.demographics.by_age_group[ageGroup] = (stats.demographics.by_age_group[ageGroup] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get lawyer workload
   */
  async getLawyerWorkload(lawyerId?: string): Promise<any[]> {
    let query = db
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        roles!inner(name)
      `)
      .eq('roles.name', 'legal_advisor')
      .eq('status', 'Active');

    if (lawyerId) {
      query = query.eq('id', lawyerId);
    }

    const { data: lawyers } = await query;

    if (!lawyers) return [];

    return Promise.all(
      lawyers.map(async (lawyer) => {
        const { data: cases } = await db
          .from('legal_aid_requests')
          .select('id, current_stage')
          .eq('assigned_lawyer_id', lawyer.id);

        const activeCases = cases?.filter(
          (c) =>
            ![
              'Completed - Documents Provided',
              'Completed - Case Resolved',
              'Completed - Referred to Litigation',
              'Completed - Withdrawn',
              'Closed - Unable to Assist',
            ].includes(c.current_stage)
        );

        const casesByStage: Record<string, number> = {};
        activeCases?.forEach((c) => {
          casesByStage[c.current_stage] = (casesByStage[c.current_stage] || 0) + 1;
        });

        const capacity = 20; // Configurable capacity per lawyer
        const utilizationRate = Math.min(((activeCases?.length || 0) / capacity) * 100, 100);

        return {
          id: lawyer.id,
          first_name: lawyer.first_name,
          last_name: lawyer.last_name,
          email: lawyer.email,
          active_cases: activeCases?.length || 0,
          capacity,
          utilization_rate: Math.round(utilizationRate * 10) / 10,
          availability:
            utilizationRate >= 100
              ? 'At Capacity'
              : utilizationRate >= 80
              ? 'Limited Availability'
              : 'Available',
          cases_by_stage: casesByStage,
        };
      })
    );
  }
}

export const legalAidService = new LegalAidService();
