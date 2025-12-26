'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute component ensures user is authenticated
 * Redirects to signin if not authenticated
 */
export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Only check authentication once on mount, not on every pathname change
    const checkAuth = () => {
      // Check for token in localStorage
      const token = localStorage.getItem('access_token');

      if (!token) {
        // No token, redirect to signin
        setIsAuthenticated(false);
        router.push(`/signin?redirect=${encodeURIComponent(pathname)}`);
        return;
      }

      // Token exists, allow access
      // The authApi interceptor will handle token refresh if needed
      setIsAuthenticated(true);
    };

    checkAuth();
  }, []); // Empty dependency array - only run once on mount

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      fallback || (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}
