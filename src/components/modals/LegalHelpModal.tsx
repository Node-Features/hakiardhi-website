'use client';

import { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface LegalHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const caseTypes = [
  { id: 'community', label: 'Community Land Rights', icon: 'users' },
  { id: 'land_dispute', label: 'Land Disputes', icon: 'briefcase' },
  { id: 'resource', label: 'Resource Disputes', icon: 'map-pin', subtitle: 'Dam, wildlife, forest' },
  { id: 'large_scale', label: 'Large Scale Acquisition', icon: 'alert-circle' },
  { id: 'eviction', label: 'Eviction & Displacement', icon: 'home' },
  { id: 'inheritance', label: 'Inheritance & Succession', icon: 'file-text', subtitle: 'Women & family rights' },
];

export default function LegalHelpModal({ isOpen, onClose }: LegalHelpModalProps) {
  const [step, setStep] = useState(1);
  const [selectedCaseType, setSelectedCaseType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    description: '',
    urgency: 'normal',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setSelectedCaseType(null);
        setFormData({
          name: '',
          phone: '',
          email: '',
          location: '',
          description: '',
          urgency: 'normal',
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
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-hakiardhi-red to-brand-500 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                {isSubmitted ? (
                  <Icon name="check" size="md" className="text-white" />
                ) : (
                  <span className="text-white font-bold text-lg">{step}</span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Get Legal Help</h2>
                <p className="text-white/80 text-sm">
                  {isSubmitted ? 'Submitted Successfully' : `Step ${step} of 3`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <Icon name="x" size="sm" className="text-white" />
            </button>
          </div>

          {/* Progress Steps */}
          {!isSubmitted && (
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 flex items-center justify-center ${
                    s < step ? 'bg-white' : s === step ? 'bg-white' : 'bg-white/30'
                  }`}
                >
                  {s < step && (
                    <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center -mt-0.5">
                      <Icon name="check" size="sm" className="text-hakiardhi-red" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isSubmitted ? (
            /* Success State */
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <Icon name="check-circle" size="xl" className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Request Submitted!</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Thank you for contacting us. Our legal team will review your case and contact you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="primary" size="md" onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  href="https://wa.me/+255784646752"
                >
                  <Icon name="phone" size="sm" className="mr-2" />
                  Continue to Chatbot
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Case Type Selection */}
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    What type of issue do you have?
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Select the category that best describes your land rights issue
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {caseTypes.map((caseType) => (
                      <button
                        key={caseType.id}
                        onClick={() => setSelectedCaseType(caseType.id)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedCaseType === caseType.id
                            ? 'border-hakiardhi-red bg-hakiardhi-red/10 shadow-md'
                            : 'border-gray-200 bg-white hover:border-hakiardhi-red/50 hover:shadow-sm'
                        }`}
                      >
                        <Icon
                          name={caseType.icon as any}
                          size="md"
                          className={selectedCaseType === caseType.id ? 'text-hakiardhi-red' : 'text-gray-400'}
                        />
                        <p className={`mt-2 font-semibold text-sm ${
                          selectedCaseType === caseType.id ? 'text-hakiardhi-red' : 'text-gray-700'
                        }`}>
                          {caseType.label}
                        </p>
                        {caseType.subtitle && (
                          <p className={`text-xs mt-0.5 ${
                            selectedCaseType === caseType.id ? 'text-hakiardhi-red/70' : 'text-gray-500'
                          }`}>
                            {caseType.subtitle}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => setStep(2)}
                    disabled={!selectedCaseType}
                  >
                    Continue
                    <Icon name="arrow-right" size="sm" className="ml-2" />
                  </Button>
                </div>
              )}

              {/* Step 2: Contact Information */}
              {step === 2 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Your Contact Information
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    We'll use this to contact you about your case
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="+255 xxx xxx xxx"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Location/Region *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        placeholder="e.g., Morogoro, Kilimanjaro"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => setStep(3)}
                      disabled={!formData.name || !formData.phone || !formData.location}
                      className="flex-1"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Case Details */}
              {step === 3 && (
                <form onSubmit={handleSubmit}>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Describe Your Issue
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Help us understand your case better
                  </p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 outline-none transition-all text-gray-900"
                      >
                        <option value="normal">Normal - No immediate deadline</option>
                        <option value="court_date">Urgent - I have a court date scheduled</option>
                        <option value="eviction">Emergency - Facing eviction threat</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Case Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-hakiardhi-red focus:ring-2 focus:ring-hakiardhi-red/20 outline-none transition-all resize-none text-gray-900 placeholder:text-gray-400"
                        placeholder="Please describe your land rights issue in detail..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setStep(2)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={!formData.description || isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Icon name="send" size="sm" className="mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* Footer - Quick Contact Options */}
        {!isSubmitted && (
          <div className="px-6 py-4 bg-hakiardhi-red/5 border-t border-hakiardhi-red/20">
            <p className="text-sm text-gray-700 font-medium mb-3">Need immediate help?</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://wa.me/+255784646752"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-green-700 transition-colors shadow-sm flex-1"
              >
                <Icon name="phone" size="sm" />
                WhatsApp Chat
              </a>
              <a
                href="tel:0800711555"
                className="inline-flex items-center justify-center gap-2 bg-hakiardhi-red text-white font-bold text-sm px-4 py-2 rounded-full hover:bg-black transition-colors shadow-sm flex-1"
              >
                <Icon name="phone" size="sm" />
                Toll-Free: 0800 711 555
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
