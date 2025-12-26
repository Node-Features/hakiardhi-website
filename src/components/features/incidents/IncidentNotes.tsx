'use client';

import React, { useState, useEffect } from 'react';
import { incidentsService } from '@/lib/api/services/incidents';
import { LoadingSpinner } from '@/components/ui/loading';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/ui/form/input/TextArea';
import { toast } from 'react-hot-toast';

interface IncidentNote {
  id: string;
  incident_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

interface IncidentNotesProps {
  incidentId: string;
}

export default function IncidentNotes({ incidentId }: IncidentNotesProps) {
  const [notes, setNotes] = useState<IncidentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadNotes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidentId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await incidentsService.getNotes(incidentId);
      setNotes(response.data || []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }

    try {
      setAdding(true);
      await incidentsService.addNote(incidentId, newNote);
      toast.success('Note added successfully');
      setNewNote('');
      setShowAddForm(false);
      loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
      toast.error('Failed to add note');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Note Button */}
      {!showAddForm && (
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Note
          </Button>
        </div>
      )}

      {/* Add Note Form */}
      {showAddForm && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Add Note</h3>
          <form onSubmit={handleAddNote} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                Note <span className="text-error-600">*</span>
              </label>
              <TextArea
                placeholder="Enter your note..."
                value={newNote}
                onChange={(value) => setNewNote(value)}
                disabled={adding}
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewNote('');
                }}
                disabled={adding}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adding}
                className="min-w-32 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-blue-800"
              >
                {adding ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Adding...</span>
                  </div>
                ) : (
                  'Add Note'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">No Notes Yet</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No notes have been added to this incident.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{note.created_by}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
