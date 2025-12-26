"use client";
import Checkbox from "@/components/ui/form/input/Checkbox";
import Input from "@/components/ui/form/input/InputField";
import TanzaniaPhoneInput from "@/components/ui/form/input/TanzaniaPhoneInput";
import Label from "@/components/ui/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/services";
import { handleAPIError } from "@/lib/api/error-handler";
import { validatePassword, passwordsMatch, isValidEmail, isValidPhoneNumber } from "@/lib/utils/validation";
import { useToast } from "@/lib/context/ToastContext";

interface Role {
  id: string;
  name: string;
  description?: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const { showToast } = useToast();

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedSex, setSelectedSex] = useState<string>("");
  const [ageGroup, setAgeGroup] = useState("");
  const [roleId, setRoleId] = useState("");
  const [photoConsent, setPhotoConsent] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Roles state
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await authService.getPublicRoles();

        console.log("Roles API response:", response);
        console.log("Response type:", typeof response);
        console.log("Is Array:", Array.isArray(response));

        // Handle both array and object responses
        if (Array.isArray(response)) {
          setRoles(response);
        } else if (response && typeof response === 'object' && 'data' in response) {
          // If response is wrapped in { data: [...] }
          const dataResponse = response as { data: Role[] };
          setRoles(Array.isArray(dataResponse.data) ? dataResponse.data : []);
        } else if (response && typeof response === 'object') {
          // Try to extract roles from any array property
          const objResponse = response as Record<string, unknown>;
          const possibleArrays = Object.values(objResponse).filter(val => Array.isArray(val));
          if (possibleArrays.length > 0) {
            setRoles(possibleArrays[0] as Role[]);
          } else {
            console.error("No array found in response:", response);
            setRoles([]);
          }
        } else {
          console.error("Unexpected roles response format:", response);
          setRoles([]);
        }
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        setError("Failed to load roles. Please refresh the page.");
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    // Client-side validation
    const errors: Record<string, string> = {};

    if (!firstName.trim()) errors.firstName = "First name is required";
    if (!lastName.trim()) errors.lastName = "Last name is required";

    if (!isValidEmail(email)) {
      errors.email = "Please enter a valid email address";
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }

    if (!passwordsMatch(password, confirmPassword)) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!isValidPhoneNumber(phoneNumber)) {
      errors.phoneNumber = "Please enter a valid Tanzania phone number (must start with 6 or 7)";
    }

    if (!selectedSex) {
      errors.sex = "Please select your sex";
    }

    if (!ageGroup) {
      errors.ageGroup = "Please select an age group";
    }

    if (!roleId) {
      errors.roleId = "Please select a role";
    }

    if (!photoConsent) {
      errors.photoConsent = "Photo consent is required";
    }

    if (!isChecked) {
      errors.terms = "You must agree to the Terms and Conditions";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    // Submit to API
    setIsLoading(true);
    try {
      const response = await authService.signup({
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        phone_number: phoneNumber,
        sex: selectedSex,
        age_group: ageGroup,
        photo_consent: photoConsent,
        role_id: roleId,
      });

      // Check if response indicates success
      console.log('Signup response:', response);

      // Show success toast
      showToast('Registration successful! Redirecting to login...', 'success');

      // Redirect to signin page after brief delay
      setTimeout(() => {
        router.push('/signin');
      }, 1500);
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = handleAPIError(err, "Sign Up");
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-[580px] mx-auto px-6 py-12">
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
            Create Account
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Join LARRRI to manage land rights and resources
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
              Sign Up
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in your information to create an account
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
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- First Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      First Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="fname"
                      name="fname"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {validationErrors.firstName && (
                      <p className="mt-1 text-xs text-error-500">{validationErrors.firstName}</p>
                    )}
                  </div>
                  {/* <!-- Last Name --> */}
                  <div className="sm:col-span-1">
                    <Label>
                      Last Name<span className="text-error-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="lname"
                      name="lname"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    {validationErrors.lastName && (
                      <p className="mt-1 text-xs text-error-500">{validationErrors.lastName}</p>
                    )}
                  </div>
                </div>
                {/* <!-- Email --> */}
                <div>
                  <Label>
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.email}</p>
                  )}
                </div>
                {/* <!-- Password --> */}
                <div>
                  <Label>
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
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
                {/* <!-- Confirm Password --> */}
                <div>
                  <Label>
                    Confirm Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm_password"
                      name="confirm_password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                  {validationErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.confirmPassword}</p>
                  )}
                </div>
                {/* <!-- Phone Number --> */}
                <div>
                  <Label>
                    Phone Number<span className="text-error-500">*</span>
                  </Label>
                  <TanzaniaPhoneInput
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    placeholder="712 345 678"
                    required
                    disabled={isLoading}
                  />
                  {validationErrors.phoneNumber && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.phoneNumber}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter your phone number. You can start with 0 (e.g., 0712345678) and it will be auto-corrected.
                  </p>
                </div>
                {/* <!-- Sex --> */}
                <div>
                  <Label>
                    Sex<span className="text-error-500">*</span>
                  </Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        value="male"
                        checked={selectedSex === "male"}
                        onChange={(e) => setSelectedSex(e.target.value)}
                        className="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                        required
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        value="female"
                        checked={selectedSex === "female"}
                        onChange={(e) => setSelectedSex(e.target.value)}
                        className="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                        required
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Female</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sex"
                        value="other"
                        checked={selectedSex === "other"}
                        onChange={(e) => setSelectedSex(e.target.value)}
                        className="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800"
                        required
                        disabled={isLoading}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Other</span>
                    </label>
                  </div>
                  {validationErrors.sex && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.sex}</p>
                  )}
                </div>
                {/* <!-- Age Group --> */}
                <div>
                  <Label>
                    Age Group<span className="text-error-500">*</span>
                  </Label>
                  <select
                    id="age_group"
                    name="age_group"
                    value={ageGroup}
                    onChange={(e) => setAgeGroup(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full pl-4 pr-10 py-3 text-sm font-normal border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white focus:border-brand-500 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select your age group</option>
                    <option value="0-17">0-17 years</option>
                    <option value="18-25">18-25 years</option>
                    <option value="26-35">26-35 years</option>
                    <option value="36-45">36-45 years</option>
                    <option value="46-60">46-60 years</option>
                    <option value="60+">60+ years</option>
                  </select>
                  {validationErrors.ageGroup && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.ageGroup}</p>
                  )}
                </div>
                {/* <!-- Role --> */}
                <div>
                  <Label>
                    Role<span className="text-error-500">*</span>
                  </Label>
                  <select
                    id="role"
                    name="role"
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    required
                    disabled={isLoading || rolesLoading}
                    className="w-full pl-4 pr-10 py-3 text-sm font-normal border rounded-lg bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white focus:border-brand-500 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {rolesLoading ? "Loading roles..." : "Select a role"}
                    </option>
                    {Array.isArray(roles) && roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.roleId && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.roleId}</p>
                  )}
                </div>
                {/* <!-- Photo Consent --> */}
                <div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      className="w-5 h-5"
                      checked={photoConsent}
                      onChange={setPhotoConsent}
                      required
                      disabled={isLoading}
                    />
                    <p className="inline-block text-sm font-normal text-gray-500 dark:text-gray-400">
                      I consent to my photo being used for LARRRI publications<span className="text-error-500">*</span>
                    </p>
                  </div>
                  {validationErrors.photoConsent && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.photoConsent}</p>
                  )}
                </div>
                {/* <!-- Terms Checkbox --> */}
                <div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      className="w-5 h-5"
                      checked={isChecked}
                      onChange={setIsChecked}
                      required
                      disabled={isLoading}
                    />
                    <p className="inline-block text-sm font-normal text-gray-500 dark:text-gray-400">
                      By creating an account means you agree to the{" "}
                      <span className="text-gray-800 dark:text-white/90">
                        Terms and Conditions,
                      </span>{" "}
                      and our{" "}
                      <span className="text-gray-800 dark:text-white">
                        Privacy Policy
                      </span>
                      <span className="text-error-500">*</span>
                    </p>
                  </div>
                  {validationErrors.terms && (
                    <p className="mt-1 text-xs text-error-500">{validationErrors.terms}</p>
                  )}
                </div>
                {/* <!-- Button --> */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full py-3.5 text-base font-semibold"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing Up..." : "Sign Up"}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Sign in instead
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
