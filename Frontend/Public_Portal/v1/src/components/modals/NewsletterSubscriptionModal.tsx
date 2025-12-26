'use client';

import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface NewsletterSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewsletterSubscriptionModal({ isOpen, onClose }: NewsletterSubscriptionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interests: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const interestOptions = [
    { id: 'land_rights', label: 'Land Rights & Tenure' },
    { id: 'policy', label: 'Policy & Advocacy' },
    { id: 'research', label: 'Research Publications' },
    { id: 'community', label: 'Community Programs' },
    { id: 'legal', label: 'Legal Aid Updates' },
    { id: 'events', label: 'Events & Training' },
  ];

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          interests: [],
        });
        setIsSubmitted(false);
      }, 300);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-hakiardhi-red to-brand-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {isSubmitted ? (
                  <Icon name="check-circle" size="md" className="text-white" />
                ) : (
                  <Icon name="mail" size="md" className="text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-black text-white">
                  {isSubmitted ? 'Subscription Confirmed!' : 'Subscribe to Our Newsletter'}
                </h2>
                <p className="text-sm text-white/80">
                  {isSubmitted ? 'Welcome to our community' : 'Stay updated with our latest research'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Icon name="close" size="sm" className="text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="check-circle" size="xl" className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Thank You for Subscribing!
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We've sent a confirmation email to <strong>{formData.email}</strong>.
                Please check your inbox and confirm your subscription to start receiving our latest updates.
              </p>
              <Button variant="primary" size="lg" onClick={onClose} fullWidth>
                <Icon name="check" size="sm" className="mr-2" />
                Done
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">
                  Full Name <span className="text-hakiardhi-red">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 font-medium text-base border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-0 focus:outline-none transition-all placeholder:text-gray-400"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-gray-900 mb-2">
                  Email Address <span className="text-hakiardhi-red">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 font-medium text-base border-2 border-gray-300 rounded-xl focus:border-hakiardhi-red focus:ring-0 focus:outline-none transition-all placeholder:text-gray-400"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Areas of Interest <span className="text-gray-400 font-normal">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {interestOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => toggleInterest(option.id)}
                      className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all focus:outline-none ${
                        formData.interests.includes(option.id)
                          ? 'border-hakiardhi-red bg-hakiardhi-red/5 text-hakiardhi-red'
                          : 'border-gray-200 text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          formData.interests.includes(option.id)
                            ? 'border-hakiardhi-red bg-hakiardhi-red'
                            : 'border-gray-300'
                        }`}>
                          {formData.interests.includes(option.id) && (
                            <Icon name="check" size="xs" className="text-white" />
                          )}
                        </div>
                        <span className="text-left flex-1">{option.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <div className="flex gap-3">
                  <Icon name="info" size="sm" className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">We respect your privacy</p>
                    <p className="text-blue-700">
                      We'll only send you relevant updates based on your interests. You can unsubscribe anytime.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Subscribing...
                  </>
                ) : (
                  <>
                    <Icon name="mail" size="sm" className="mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
