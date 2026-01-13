"use client";
import React from "react";
import Link from "next/link";

const AppFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-mobile-static">
      {/* Mobile View - Compact Single Line */}
      <div className="flex flex-col gap-2 py-3 px-4 lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-mobile-xs text-gray-600 dark:text-gray-400">
            © {currentYear} HakiArdhi
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="text-mobile-xs text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-mobile-xs text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop View - Full Footer */}
      <div className="hidden lg:block">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                HakiArdhi Digital Ecosystem
              </p>
              <p className="text-theme-xs text-gray-600 dark:text-gray-400">
                © {currentYear} All rights reserved.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-theme-sm text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-theme-sm text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-theme-sm text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/support"
                className="text-theme-sm text-gray-600 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
