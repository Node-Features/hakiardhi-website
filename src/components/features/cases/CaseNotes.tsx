'use client';

import React, { useState, useEffect } from 'react';
import { casesService } from '@/lib/api/services/cases';
import { useToast } from '@/lib/context/ToastContext';
import { LoadingSpinner } from '@/components/ui/loading';
import Button from '@/components/ui/button/Button';
import TextArea from '@/components/ui/form/input/TextArea';

interface CaseNote {
  id: string;
  note: string;
  created_by?: string;
  created_at: string;
}

interface CaseNotesProps {
  caseId: string;
}

export default function CaseNotes({ caseId }: CaseNotesProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    loadNotes();
  }, [caseId]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const response = await casesService.getNotes(caseId);
      setNotes(response.data || []);
    } catch (error: any) {
      console.error('Failed to load notes:', error);
      showToast('Failed to load notes', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsSubmitting(true);
    try {
      await casesService.addNote(caseId, newNote);
      showToast('Note added successfully', 'success');
      setNewNote('');
      loadNotes();
    } catch (error: any) {
      console.error('Failed to add note:', error);
      showToast('Failed to add note', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" text="Loading notes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
          Add New Note
        </h3>
        <TextArea
          placeholder="Type your note here..."
          value={newNote}
          onChange={(value) => setNewNote(value)}
          rows={4}
          disabled={isSubmitting}
          className="mb-3"
        />
        <div className="flex items-center justify-end">
          <Button
            type="submit"
            disabled={isSubmitting || !newNote.trim()}
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </Button>
        </div>
      </form>

      {/* Notes List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Case Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
              No notes yet
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Add notes to track important information about this case
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                    <svg className="h-5 w-5 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 dark:text-white/90 whitespace-pre-wrap">
                      {note.note}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      {note.created_by && (
                        <>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {note.created_by}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
