import React from "react";

interface TextareaProps {
  placeholder?: string; // Placeholder text
  rows?: number; // Number of rows
  value?: string; // Current value
  onChange?: (value: string) => void; // Change handler
  className?: string; // Additional CSS classes
  disabled?: boolean; // Disabled state
  error?: boolean; // Error state
  hint?: string; // Hint text to display
  maxLength?: number; // Maximum character length
  showCounter?: boolean; // Show character counter
  counterPosition?: 'bottom-right' | 'bottom-left'; // Counter position
  label?: string; // Optional label
  required?: boolean; // Required field indicator
}

const TextArea: React.FC<TextareaProps> = ({
  placeholder = "Enter your message", // Default placeholder
  rows = 3, // Default number of rows
  value = "", // Default value
  onChange, // Callback for changes
  className = "", // Additional custom styles
  disabled = false, // Disabled state
  error = false, // Error state
  hint = "", // Default hint text
  maxLength, // Maximum character length
  showCounter = false, // Show character counter (default false)
  counterPosition = 'bottom-right', // Counter position
  label, // Optional label
  required = false, // Required field indicator
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (onChange) {
      const newValue = e.target.value;
      // Enforce maxLength if specified
      if (maxLength && newValue.length > maxLength) {
        return; // Don't update if exceeds max length
      }
      onChange(newValue);
    }
  };

  // Calculate character count percentage for color coding
  const currentLength = value?.length || 0;
  const getCounterColor = () => {
    if (!maxLength) return 'text-gray-500 dark:text-gray-400';

    const percentage = (currentLength / maxLength) * 100;

    if (percentage < 80) {
      return 'text-green-600 dark:text-green-400'; // Safe zone
    } else if (percentage < 95) {
      return 'text-yellow-600 dark:text-yellow-500'; // Warning zone
    } else {
      return 'text-red-600 dark:text-red-400'; // Danger zone
    }
  };

  let textareaClasses = `w-full rounded-lg border px-4 py-2.5 text-sm shadow-theme-xs focus:outline-hidden ${className}`;

  if (disabled) {
    textareaClasses += ` bg-gray-100 opacity-50 text-gray-500 border-gray-300 cursor-not-allowed dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700`;
  } else if (error) {
    textareaClasses += ` bg-transparent text-gray-400 border-gray-300 focus:border-error-300 focus:ring-3 focus:ring-error-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-error-800`;
  } else {
    textareaClasses += ` bg-transparent text-gray-400 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800`;
  }

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}

      {/* Textarea Container */}
      <div className="relative">
        <textarea
          placeholder={placeholder}
          rows={rows}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          maxLength={maxLength}
          className={textareaClasses}
        />

        {/* Character Counter */}
        {showCounter && (
          <div
            className={`absolute bottom-2 text-xs font-medium ${getCounterColor()} ${
              counterPosition === 'bottom-left' ? 'left-3' : 'right-3'
            }`}
          >
            {currentLength}
            {maxLength && `/${maxLength}`}
          </div>
        )}
      </div>

      {/* Hint Text */}
      {hint && (
        <p
          className={`mt-2 text-sm ${
            error ? "text-error-500" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default TextArea;
