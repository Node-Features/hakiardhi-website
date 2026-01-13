"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import Backdrop from "@/components/layout/Backdrop";
import AppFooter from "@/components/layout/AppFooter";
import ProtectedRoute from "@/components/features/auth/ProtectedRoute";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden xl:flex">
        {/* Sidebar and Backdrop */}
        <AppSidebar />
        <Backdrop />
        {/* Main Content Area */}
        <div
          className={`flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${mainContentMargin}`}
        >
          {/* Header */}
          <AppHeader />
          {/* Page Content with Footer */}
          <div className="flex flex-col min-h-[calc(100vh-64px)] lg:min-h-[calc(100vh-72px)]">
            <div className="flex-1 p-4 mx-auto w-full max-w-(--breakpoint-2xl) md:p-6">
              {children}
            </div>
            <AppFooter />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
