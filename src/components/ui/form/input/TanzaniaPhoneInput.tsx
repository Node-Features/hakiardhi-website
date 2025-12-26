"use client";
import React, { useState, useEffect } from "react";
import { normalizeTanzaniaPhone } from "@/lib/utils/validation";

interface TanzaniaPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Tanzania-specific phone input component
 * - Displays country code prefix "255"
 * - Auto-corrects numbers starting with 0 (e.g., 0712345678 -> 255712345678)
 * - Stores numbers in 255XXXXXXXXX format
 */
const TanzaniaPhoneInput: React.FC<TanzaniaPhoneInputProps> = ({
  value,
  onChange,
  placeholder = "712 345 678",
  required = false,
  disabled = false,
  className = "",
}) => {
  // Display value (the part after 255)
  const [displayValue, setDisplayValue] = useState<string>("");

  // Initialize display value from prop
  useEffect(() => {
    if (value) {
      const normalized = normalizeTanzaniaPhone(value);
      if (normalized.startsWith('255') && normalized.length >= 3) {
        setDisplayValue(normalized.substring(3));
      } else if (normalized) {
        setDisplayValue(normalized);
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // Remove all non-digit characters
    input = input.replace(/\D/g, '');

    // Handle if user pastes a number starting with 0
    if (input.startsWith('0') && input.length === 10) {
      // Auto-correct: 0712345678 -> 712345678
      input = input.substring(1);
    }

    // Handle if user pastes a number starting with 255
    if (input.startsWith('255')) {
      // Remove the 255 prefix for display
      input = input.substring(3);
    }

    // Limit to 9 digits (Tanzania mobile numbers without country code)
    if (input.length > 9) {
      input = input.substring(0, 9);
    }

    // Update display value
    setDisplayValue(input);

    // Send normalized value (with 255 prefix) to parent
    if (input.length > 0) {
      const normalized = normalizeTanzaniaPhone(input);
      onChange(normalized);
    } else {
      onChange('');
    }
  };

  const handleBlur = () => {
    // On blur, normalize the value
    if (displayValue) {
      const normalized = normalizeTanzaniaPhone(displayValue);
      onChange(normalized);
    }
  };

  // Format display value with spaces for better readability
  const formatDisplayValue = (val: string): string => {
    if (!val) return '';

    // Remove any existing spaces
    const cleaned = val.replace(/\s/g, '');

    // Format as XXX XXX XXX
    const parts: string[] = [];
    if (cleaned.length > 0) parts.push(cleaned.substring(0, 3));
    if (cleaned.length > 3) parts.push(cleaned.substring(3, 6));
    if (cleaned.length > 6) parts.push(cleaned.substring(6, 9));

    return parts.join(' ');
  };

  return (
    <div className="relative flex items-center">
      {/* Country code prefix (fixed) */}
      <div className="absolute left-0 z-10 flex items-center h-full px-4 text-sm font-medium text-gray-700 bg-gray-100 border-r border-gray-300 pointer-events-none rounded-l-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
        255
      </div>

      {/* Phone number input */}
      <input
        type="tel"
        value={formatDisplayValue(displayValue)}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`w-full pl-[70px] pr-4 py-3 text-sm font-normal border rounded-lg bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      />
    </div>
  );
};

export default TanzaniaPhoneInput;
