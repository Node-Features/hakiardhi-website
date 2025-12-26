"use client";
import Checkbox from "@/components/ui/form/input/Checkbox";
import Input from "@/components/ui/form/input/InputField";
import Label from "@/components/ui/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/lib/api/services";
import { handleAPIError } from "@/lib/api/error-handler";
import { isValidEmail } from "@/lib/utils/validation";
import { useToast } from "@/lib/context/ToastContext";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!password) {
      errors.password = "Password is required";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Submit to API
    setIsLoading(true);
    try {
      const response = await authService.signin({
        email: email.trim(),
        password: password,
      });

      // Show success toast
      showToast('Login successful! Welcome back.', 'success');

      // Redirect to requested page or dashboard
      const redirectUrl = searchParams.get('redirect') || '/';
      setTimeout(() => {
        router.push(redirectUrl);
      }, 500);
    } catch (err: any) {
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Signin error:', err?.message || err);
      }

      // Extract detailed error message
      let errorMessage = 'Sign in failed. Please try again.';

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.data?.error) {
        errorMessage = typeof err.data.error === 'string'
          ? err.data.error
          : err.data.error.message || errorMessage;
      }

      // Handle validation errors
      if (err?.data?.errors) {
        if (Array.isArray(err.data.errors)) {
          errorMessage = err.data.errors.map((e: any) => e.message || e).join(', ');
        } else if (typeof err.data.errors === 'object') {
          const fieldErrors = Object.entries(err.data.errors)
            .map(([field, msgs]) => {
              const messages = Array.isArray(msgs) ? msgs.join(', ') : msgs;
              return `${field}: ${messages}`;
            })
            .join('; ');
          errorMessage = fieldErrors;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen">
      <div className="flex flex-col justify-center flex-1 w-full max-w-[480px] mx-auto px-6 py-12">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="mb-6">
            <Image
              className="dark:hidden"
              src="/images/logo/logo-icon.png"
              alt="LARRRI Logo"
              width={80}
              height={80}
              priority
            />
            <Image
              className="hidden dark:block"
              src="/images/logo/logo-dark.png"
              alt="LARRRI Logo"
              width={150}
              height={40}
              priority
            />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-center text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Sign in to access your account
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
              Sign In
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to continue
            </p>
          </div>
          <div>
            {/* Global Error Message */}
            {error && (
              <div className="mb-5 p-4 rounded-lg bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800">
                <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.email}</p>
                  )}
                </div>
                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.password}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={rememberMe}
                      onChange={setRememberMe}
                      disabled={isLoading}
                    />
                    <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                      Remember me
                    </span>
                  </div>
                  <Link
                    href="/reset-password"
                    className="text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full py-3.5 text-base font-semibold"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} Land Rights Research and Resources Institute. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <Link href="/privacy-policy" className="text-sm text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400">
              Privacy Policy
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400">
              Terms of Service
            </Link>
            <span className="text-gray-300 dark:text-gray-700">•</span>
            <Link href="/cookie-policy" className="text-sm text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400">
              Cookie Policy
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
