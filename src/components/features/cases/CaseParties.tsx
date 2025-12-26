'use client';

import React, { useState, useEffect } from 'react';
import { casesService } from '@/lib/api/services/cases';
import { useToast } from '@/lib/context/ToastContext';
import { LoadingSpinner } from '@/components/ui/loading';
import Button from '@/components/ui/button/Button';
import Input from '@/components/ui/form/input/InputField';
import Select from '@/components/ui/form/Select';
import Badge from '@/components/ui/badge/Badge';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal';

interface Party {
  id: string;
  name: string;
  role: 'Plaintiff' | 'Defendant' | 'Witness' | 'Other';
  contact_info?: string;
  created_at: string;
}

interface CasePartiesProps {
  caseId: string;
}

export default function CaseParties({ caseId }: CasePartiesProps) {
  const { showToast } = useToast();
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'Other' as 'Plaintiff' | 'Defendant' | 'Witness' | 'Other',
    contact_info: '',
  });

  useEffect(() => {
    loadParties();
  }, [caseId]);

  const loadParties = async () => {
    setIsLoading(true);
    try {
      const response = await casesService.getParties(caseId);
      setParties(response.data || []);
    } catch (error: any) {
      console.error('Failed to load parties:', error);
      showToast('Failed to load parties', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await casesService.addParty(caseId, formData);
      showToast('Party added successfully', 'success');
      setIsAddModalOpen(false);
      setFormData({ name: '', role: 'Other', contact_info: '' });
      loadParties();
    } catch (error: any) {
      console.error('Failed to add party:', error);
      showToast('Failed to add party', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveParty = async (partyId: string) => {
    if (!confirm('Are you sure you want to remove this party?')) return;

    try {
      await casesService.removeParty(caseId, partyId);
      showToast('Party removed successfully', 'success');
      loadParties();
    } catch (error: any) {
      console.error('Failed to remove party:', error);
      showToast('Failed to remove party', 'error');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Plaintiff':
        return 'primary';
      case 'Defendant':
        return 'warning';
      case 'Witness':
        return 'info';
      default:
        return 'light';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Plaintiff':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'Defendant':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'Witness':
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
    }
  };

  const groupedParties = parties.reduce((acc, party) => {
    if (!acc[party.role]) {
      acc[party.role] = [];
    }
    acc[party.role].push(party);
    return acc;
  }, {} as Record<string, Party[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" text="Loading parties..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Case Parties
        </h3>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Party
        </Button>
      </div>

      {parties.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
            No parties added
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Add plaintiffs, defendants, witnesses, and other parties involved in the case
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedParties).map(([role, roleParties]) => (
            <div key={role}>
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                {getRoleIcon(role)}
                {role}s ({roleParties.length})
              </h4>
              <div className="space-y-2">
                {roleParties.map((party) => (
                  <div
                    key={party.id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30">
                        <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
                          {party.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-800 dark:text-white/90">
                            {party.name}
                          </h5>
                          <Badge
                            variant="light"
                            color={getRoleBadgeColor(party.role) as any}
                            size="sm"
                          >
                            {party.role}
                          </Badge>
                        </div>
                        {party.contact_info && (
                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {party.contact_info}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveParty(party.id)}
                      className="text-sm text-error-500 hover:text-error-600"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Party Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} size="md">
        <ModalHeader>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Add Party
          </h2>
        </ModalHeader>
        <form onSubmit={handleAddParty}>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Name <span className="text-error-600">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter party name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Role <span className="text-error-600">*</span>
                </label>
                <Select
                  options={[
                    { value: 'Plaintiff', label: 'Plaintiff' },
                    { value: 'Defendant', label: 'Defendant' },
                    { value: 'Witness', label: 'Witness' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  placeholder="Select role"
                  value={formData.role}
                  onChange={(value) => setFormData({ ...formData, role: value as any })}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
                  Contact Information
                </label>
                <Input
                  type="text"
                  placeholder="Phone, email, or address"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding...' : 'Add Party'}
              </Button>
            </div>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
