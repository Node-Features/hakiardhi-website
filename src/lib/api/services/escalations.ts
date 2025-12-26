/**
 * Escalation API Service
 *
 * This service handles all API calls related to incident escalations.
 * Currently uses mock data for frontend development (Phase 1).
 * Will be replaced with real API calls in Phase 2 backend integration.
 */

import {
  CreateEscalationRequest,
  UpdateEscalationRequest,
  EscalationResponse,
  EscalationNote,
  EscalationStats,
  MOCK_ESCALATIONS,
  MOCK_ESCALATION_NOTES,
  generateEscalationId,
  ESCALATION_REASON_LABELS,
} from '@/types/escalation';

// =============================================================================
// MOCK DATA STORAGE
// =============================================================================

/**
 * In-memory storage for mock escalations
 * This simulates a database for frontend development
 */
let mockEscalationsStore: EscalationResponse[] = [...MOCK_ESCALATIONS];
let mockNotesStore: EscalationNote[] = [...MOCK_ESCALATION_NOTES];

/**
 * Reset mock data to initial state (useful for testing)
 */
export function resetMockData(): void {
  mockEscalationsStore = [...MOCK_ESCALATIONS];
  mockNotesStore = [...MOCK_ESCALATION_NOTES];
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Simulates network delay for realistic API behavior
 */
function simulateNetworkDelay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 300 + Math.random() * 200); // 300-500ms delay
  });
}

/**
 * Get current user (mock implementation)
 */
function getCurrentUser() {
  return {
    id: 'current-user-id',
    name: 'Current User',
  };
}

// =============================================================================
// ESCALATION SERVICE METHODS
// =============================================================================

export const escalationsService = {
  /**
   * Get all escalations for a specific incident
   *
   * @param incidentId - The incident ID to fetch escalations for
   * @returns Promise resolving to array of escalations
   */
  getByIncident: async (incidentId: string): Promise<{ data: EscalationResponse[] }> => {
    await simulateNetworkDelay();

    const escalations = mockEscalationsStore
      .filter((esc) => esc.incident_id === incidentId || esc.incident_id === '')
      .map((esc) => ({
        ...esc,
        incident_id: incidentId, // Ensure incident_id is set
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { data: escalations };
  },

  /**
   * Get a single escalation by ID
   *
   * @param id - The escalation ID
   * @returns Promise resolving to escalation data
   */
  getById: async (id: string): Promise<{ data: EscalationResponse | null }> => {
    await simulateNetworkDelay();

    const escalation = mockEscalationsStore.find((esc) => esc.id === id);

    return { data: escalation || null };
  },

  /**
   * Create a new escalation
   *
   * @param data - Escalation creation data
   * @returns Promise resolving to created escalation
   */
  create: async (data: CreateEscalationRequest): Promise<{ data: EscalationResponse }> => {
    await simulateNetworkDelay();

    const currentUser = getCurrentUser();
    const now = new Date().toISOString();

    // Generate escalated_to_name based on level
    let escalated_to_name: string | undefined;
    if (data.escalation_level === 'executive') {
      escalated_to_name = 'Executive Management';
    } else if (data.escalation_level === 'admin') {
      escalated_to_name = 'Administrator Team';
    } else if (data.escalation_level === 'department_head' && data.department) {
      const departmentNames: Record<string, string> = {
        legal: 'Legal Affairs Department',
        field_ops: 'Field Operations Department',
        community: 'Community Relations Department',
        management: 'Management Department',
      };
      escalated_to_name = departmentNames[data.department];
    } else if (data.escalated_to) {
      // In a real app, this would fetch the user's name from the API
      escalated_to_name = 'Assigned User';
    }

    const newEscalation: EscalationResponse = {
      id: generateEscalationId(),
      incident_id: data.incident_id,
      escalated_by: currentUser.id,
      escalated_by_name: currentUser.name,
      escalated_to: data.escalated_to,
      escalated_to_name,
      escalation_level: data.escalation_level,
      department: data.department,
      reason: data.reason,
      reason_label: ESCALATION_REASON_LABELS[data.reason],
      description: data.description,
      priority: data.priority,
      deadline: data.deadline,
      status: 'pending',
      created_at: now,
      updated_at: now,
    };

    mockEscalationsStore.push(newEscalation);

    return { data: newEscalation };
  },

  /**
   * Update an existing escalation
   *
   * @param id - The escalation ID
   * @param data - Updated escalation data
   * @returns Promise resolving to updated escalation
   */
  update: async (
    id: string,
    data: UpdateEscalationRequest
  ): Promise<{ data: EscalationResponse }> => {
    await simulateNetworkDelay();

    const index = mockEscalationsStore.findIndex((esc) => esc.id === id);

    if (index === -1) {
      throw new Error(`Escalation with ID ${id} not found`);
    }

    const updatedEscalation: EscalationResponse = {
      ...mockEscalationsStore[index],
      ...data,
      reason_label: data.reason
        ? ESCALATION_REASON_LABELS[data.reason]
        : mockEscalationsStore[index].reason_label,
      updated_at: new Date().toISOString(),
    };

    mockEscalationsStore[index] = updatedEscalation;

    return { data: updatedEscalation };
  },

  /**
   * Resolve an escalation
   *
   * @param id - The escalation ID
   * @param resolutionNotes - Notes explaining the resolution
   * @returns Promise resolving to updated escalation
   */
  resolve: async (id: string, resolutionNotes: string): Promise<{ data: EscalationResponse }> => {
    await simulateNetworkDelay();

    const index = mockEscalationsStore.findIndex((esc) => esc.id === id);

    if (index === -1) {
      throw new Error(`Escalation with ID ${id} not found`);
    }

    const now = new Date().toISOString();

    const resolvedEscalation: EscalationResponse = {
      ...mockEscalationsStore[index],
      status: 'resolved',
      resolution_notes: resolutionNotes,
      resolved_at: now,
      updated_at: now,
    };

    mockEscalationsStore[index] = resolvedEscalation;

    return { data: resolvedEscalation };
  },

  /**
   * Reject an escalation
   *
   * @param id - The escalation ID
   * @param rejectionReason - Reason for rejection
   * @returns Promise resolving to updated escalation
   */
  reject: async (id: string, rejectionReason: string): Promise<{ data: EscalationResponse }> => {
    await simulateNetworkDelay();

    const index = mockEscalationsStore.findIndex((esc) => esc.id === id);

    if (index === -1) {
      throw new Error(`Escalation with ID ${id} not found`);
    }

    const now = new Date().toISOString();

    const rejectedEscalation: EscalationResponse = {
      ...mockEscalationsStore[index],
      status: 'rejected',
      resolution_notes: `Rejected: ${rejectionReason}`,
      resolved_at: now,
      updated_at: now,
    };

    mockEscalationsStore[index] = rejectedEscalation;

    return { data: rejectedEscalation };
  },

  /**
   * Acknowledge an escalation (mark as seen/received)
   *
   * @param id - The escalation ID
   * @returns Promise resolving to updated escalation
   */
  acknowledge: async (id: string): Promise<{ data: EscalationResponse }> => {
    await simulateNetworkDelay();

    const index = mockEscalationsStore.findIndex((esc) => esc.id === id);

    if (index === -1) {
      throw new Error(`Escalation with ID ${id} not found`);
    }

    const acknowledgedEscalation: EscalationResponse = {
      ...mockEscalationsStore[index],
      status: 'acknowledged',
      updated_at: new Date().toISOString(),
    };

    mockEscalationsStore[index] = acknowledgedEscalation;

    return { data: acknowledgedEscalation };
  },

  /**
   * Move escalation to in-review status
   *
   * @param id - The escalation ID
   * @returns Promise resolving to updated escalation
   */
  startReview: async (id: string): Promise<{ data: EscalationResponse }> => {
    await simulateNetworkDelay();

    const index = mockEscalationsStore.findIndex((esc) => esc.id === id);

    if (index === -1) {
      throw new Error(`Escalation with ID ${id} not found`);
    }

    const reviewingEscalation: EscalationResponse = {
      ...mockEscalationsStore[index],
      status: 'in_review',
      updated_at: new Date().toISOString(),
    };

    mockEscalationsStore[index] = reviewingEscalation;

    return { data: reviewingEscalation };
  },

  /**
   * Delete an escalation
   *
   * @param id - The escalation ID
   * @returns Promise resolving when deletion is complete
   */
  delete: async (id: string): Promise<void> => {
    await simulateNetworkDelay();

    mockEscalationsStore = mockEscalationsStore.filter((esc) => esc.id !== id);
  },

  /**
   * Add a follow-up note to an escalation
   *
   * @param escalationId - The escalation ID
   * @param content - Note content
   * @returns Promise resolving to created note
   */
  addNote: async (escalationId: string, content: string): Promise<{ data: EscalationNote }> => {
    await simulateNetworkDelay();

    const currentUser = getCurrentUser();

    const newNote: EscalationNote = {
      id: `note-${Date.now()}`,
      escalation_id: escalationId,
      content,
      created_by: currentUser.id,
      created_by_name: currentUser.name,
      created_at: new Date().toISOString(),
    };

    mockNotesStore.push(newNote);

    return { data: newNote };
  },

  /**
   * Get all notes for an escalation
   *
   * @param escalationId - The escalation ID
   * @returns Promise resolving to array of notes
   */
  getNotes: async (escalationId: string): Promise<{ data: EscalationNote[] }> => {
    await simulateNetworkDelay();

    const notes = mockNotesStore
      .filter((note) => note.escalation_id === escalationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    return { data: notes };
  },

  /**
   * Get escalation statistics
   *
   * @returns Promise resolving to escalation stats
   */
  getStats: async (): Promise<{ data: EscalationStats }> => {
    await simulateNetworkDelay();

    const total = mockEscalationsStore.length;
    const active = mockEscalationsStore.filter((esc) =>
      ['pending', 'acknowledged', 'in_review'].includes(esc.status)
    ).length;
    const resolved = mockEscalationsStore.filter((esc) => esc.status === 'resolved').length;

    // Calculate average resolution time for resolved escalations
    const resolvedEscalations = mockEscalationsStore.filter(
      (esc) => esc.status === 'resolved' && esc.resolved_at
    );
    let avgResolutionTime = 0;
    if (resolvedEscalations.length > 0) {
      const totalTime = resolvedEscalations.reduce((sum, esc) => {
        const created = new Date(esc.created_at).getTime();
        const resolved = new Date(esc.resolved_at!).getTime();
        return sum + (resolved - created);
      }, 0);
      avgResolutionTime = totalTime / resolvedEscalations.length / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Count by level
    const byLevel = mockEscalationsStore.reduce(
      (acc, esc) => {
        acc[esc.escalation_level] = (acc[esc.escalation_level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Count by priority
    const byPriority = mockEscalationsStore.reduce(
      (acc, esc) => {
        acc[esc.priority] = (acc[esc.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      data: {
        total_escalations: total,
        active_escalations: active,
        resolved_escalations: resolved,
        average_resolution_time_days: Number(avgResolutionTime.toFixed(1)),
        escalations_by_level: byLevel as any,
        escalations_by_priority: byPriority as any,
      },
    };
  },
};

export default escalationsService;
