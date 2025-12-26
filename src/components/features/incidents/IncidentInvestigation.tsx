'use client';

import React, { useState, useEffect } from 'react';
import { incidentsService } from '@/lib/api/services/incidents';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

interface Investigation {
  id: string;
  incident_id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  investigator: string;
  started_at: string;
  completed_at?: string;
  findings?: string;
  created_at: string;
}

interface IncidentInvestigationProps {
  incidentId: string;
}

export default function IncidentInvestigation({ incidentId }: IncidentInvestigationProps) {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadInvestigations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  const loadInvestigations = async () => {
    try {
      setLoading(true);
      const response = await incidentsService.getInvestigations(incidentId);
      setInvestigations(response.data || []);
    } catch (error) {
      console.error('Failed to load investigations:', error);
      toast.error('Failed to load investigations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleInvestigation = async (investigationId: string) => {
    if (expandedId === investigationId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(investigationId);
    // In a real implementation, you would fetch detailed investigation data here
    // For now, we'll just expand the accordion
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      Completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (investigations.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          No Investigations Yet
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          No investigations have been started for this incident.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {investigations.map((investigation) => (
        <div
          key={investigation.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all dark:border-gray-700 dark:bg-gray-800"
        >
          {/* Accordion Header */}
          <button
            onClick={() => handleToggleInvestigation(investigation.id)}
            className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {investigation.title}
                </h3>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(investigation.status)}`}>
                  {investigation.status}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {investigation.investigator}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Started {new Date(investigation.started_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <svg
              className={`h-6 w-6 text-gray-400 transition-transform ${expandedId === investigation.id ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Accordion Content */}
          {expandedId === investigation.id && (
            <div className="border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
              {loadingDetails === investigation.id ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Description
                    </label>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {investigation.description}
                    </p>
                  </div>

                  {/* Findings */}
                  {investigation.findings && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Findings
                      </label>
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {investigation.findings}
                      </p>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Started
                      </label>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(investigation.started_at).toLocaleString()}
                      </p>
                    </div>
                    {investigation.completed_at && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Completed
                        </label>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(investigation.completed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
