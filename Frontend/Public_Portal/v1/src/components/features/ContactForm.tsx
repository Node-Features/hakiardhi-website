/**
 * Reusable Contact Form Component
 * Following COMPONENT_REUSABILITY_GUIDE.md
 */

'use client';

import { useState, FormEvent } from 'react';
import { FormField, Input, Textarea, Select } from '../ui/Form';
import Button from '../ui/Button';
import Icon from '../ui/Icon';
import Alert from '../ui/Alert';
import { SPACING } from '@/constants/design-tokens';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  organization: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  subjectOptions?: string[];
  onSubmit?: (data: ContactFormData) => Promise<void>;
}

const defaultSubjectOptions = [
  'General Inquiry',
  'Legal Aid Request',
  'Partnership Opportunity',
  'Media Request',
  'Employment Inquiry',
  'Research Collaboration',
  'Training Request',
  'Other',
];

export default function ContactForm({ subjectOptions = defaultSubjectOptions, onSubmit }: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    subject: subjectOptions[0],
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[0-9+\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof ContactFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstErrorField = Object.keys(errors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Default behavior: simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        subject: subjectOptions[0],
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {submitStatus === 'success' && (
        <div className={SPACING.margin.element.md}>
          <Alert
            variant="success"
            title="Message Sent Successfully!"
            message="Thank you for contacting us. We'll respond to your inquiry within 24-48 hours."
          />
        </div>
      )}

      {submitStatus === 'error' && (
        <div className={SPACING.margin.element.md}>
          <Alert
            variant="error"
            title="Something Went Wrong"
            message="We couldn't send your message. Please try again or contact us directly via email."
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className={SPACING.component.default}>
        <FormField id="name" label="Full Name" required error={errors.name}>
          <Input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            hasError={!!errors.name}
            placeholder="Enter your full name"
          />
        </FormField>

        <FormField id="email" label="Email Address" required error={errors.email}>
          <Input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            hasError={!!errors.email}
            placeholder="your.email@example.com"
          />
        </FormField>

        <FormField id="phone" label="Phone Number" error={errors.phone}>
          <Input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            hasError={!!errors.phone}
            placeholder="+255 784 646 752"
          />
        </FormField>

        <FormField id="organization" label="Organization (Optional)">
          <Input
            type="text"
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleChange}
            placeholder="Your organization name"
          />
        </FormField>

        <FormField id="subject" label="Subject" required>
          <Select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            options={subjectOptions.map(opt => ({ value: opt, label: opt }))}
          />
        </FormField>

        <FormField
          id="message"
          label="Message"
          required
          error={errors.message}
          helpText={`${formData.message.length} / 1000 characters`}
        >
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            hasError={!!errors.message}
            rows={6}
            maxLength={1000}
            placeholder="Tell us how we can help you..."
          />
        </FormField>

        <Button type="submit" variant="primary" size="lg" fullWidth disabled={isSubmitting} className="relative">
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending...
            </span>
          ) : (
            <>
              <Icon name="paper-airplane" size="md" className="mr-2" />
              Send Message
            </>
          )}
        </Button>

        <p className="text-sm text-gray-600 text-center">
          We respect your privacy. Your information will only be used to respond to your inquiry.
        </p>
      </form>
    </>
  );
}
