import React, { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode; // Button text or content
  size?: "sm" | "md"; // Button size
  variant?: "primary" | "outline" | "pill" | "secondary" | "ghost"; // Button variant
  startIcon?: ReactNode; // Icon before the text
  endIcon?: ReactNode; // Icon after the text
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // Click handler
  disabled?: boolean; // Disabled state
  className?: string; // Additional CSS classes
  type?: "button" | "submit" | "reset"; // Button type
  form?: string; // Form ID to associate with (for submit buttons outside form)
  /**
   * Shape of the button
   * @default 'pill' - fully rounded pill shape
   * @example 'rounded' - standard rounded corners
   */
  shape?: "rounded" | "pill";
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  form,
  shape = "pill",
}) => {
  // Size Classes
  const sizeClasses = {
    sm: "px-4 py-3 text-sm",
    md: "px-5 py-3.5 text-sm",
  };

  // Variant Classes
  const variantClasses = {
    primary:
      "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
    outline:
      "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
    pill:
      "bg-white text-black border-2 border-black hover:bg-black hover:text-white dark:bg-gray-900 dark:text-white dark:border-white dark:hover:bg-white dark:hover:text-black transition-all duration-300",
    secondary:
      "bg-gray-200 text-gray-800 shadow-theme-xs hover:bg-gray-300 disabled:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
  };

  // Shape Classes
  const shapeClasses = {
    rounded: "rounded-lg",
    pill: "rounded-full",
  };

  return (
    <button
      type={type}
      form={form}
      className={`inline-flex items-center justify-center font-medium gap-2 transition ${className} ${
        sizeClasses[size]
      } ${variantClasses[variant]} ${shapeClasses[shape]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </button>
  );
};

export default Button;
