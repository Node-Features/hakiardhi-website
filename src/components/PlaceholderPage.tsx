"use client";
import React from "react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="max-w-md text-center">
        {icon && (
          <div className="flex justify-center mb-6 text-brand-500">
            <div className="w-16 h-16">{icon}</div>
          </div>
        )}
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mb-8 text-lg text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
        <div className="inline-block px-4 py-2 text-sm font-medium text-white rounded-lg bg-brand-500">
          Coming Soon
        </div>
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
          This page is under development and will be available soon.
        </p>
      </div>
    </div>
  );
}
