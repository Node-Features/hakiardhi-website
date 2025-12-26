import ThemeTogglerTwo from "@/components/layout/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <ThemeProvider>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-gray-100 dark:bg-grid-gray-800/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] pointer-events-none" />

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/5 dark:bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-400/5 dark:bg-brand-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex w-full min-h-screen justify-center items-center">
          {children}

          {/* Theme Toggler */}
          <div className="fixed top-6 right-6 z-50">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
