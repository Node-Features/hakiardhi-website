"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/services/auth";
import { usersService } from "@/lib/api/services";
import { clearSession, getSession } from "@/lib/auth/session";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string | null;
  sex?: string | null;
  age_group?: string | null;
  photo_consent?: boolean;
  status?: string;
  created_at?: string;
  role?: string | { id: string; name: string }; // Primary role name or role object
  role_id?: string; // Primary role ID
  roles?: string[]; // All user roles (for users with multiple roles)
  image_url?: string | null;
  permissions?: string[]; // All user permissions (from all roles)
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user session on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        let userFromStorage = null;

        // First try to get user from localStorage for immediate display
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user");
          const accessToken = localStorage.getItem("access_token");

          console.log("🔍 AuthContext: Loading user from localStorage");
          console.log("  - storedUser:", storedUser);
          console.log("  - hasToken:", !!accessToken);

          if (storedUser && accessToken) {
            userFromStorage = JSON.parse(storedUser);
            console.log("  - Parsed user:", userFromStorage);
            setUser(userFromStorage);
          }
        }

        // Then fetch fresh session data from server (only if we have a token)
        if (userFromStorage) {
          console.log("🔍 AuthContext: Fetching fresh session from server");
          const sessionUser = await getSession();
          console.log("  - Session user:", sessionUser);

          if (sessionUser) {
            // Update with fresh session data
            setUser(sessionUser);
          } else {
            // Session check failed but we have user in storage
            // Keep using localStorage user for now, don't clear immediately
            console.log("⚠️ Session check failed, using cached user data");
          }
        } else {
          // No user in storage, redirect to login if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
            console.log("🔓 No user session found, redirecting to login...");
            router.push('/signin');
          }
        }
      } catch (error) {
        console.error("❌ Error loading user session:", error);

        // Only clear and redirect if there's no user in storage
        const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        if (!storedUser) {
          clearSession();
          setUser(null);

          // Redirect to signin on error if not already there
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/signin')) {
            router.push('/signin');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.signin({ email, password });
      setUser(response.user);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.signout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      clearSession();
      router.push("/signin");
    }
  }, [router]);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await usersService.getProfile();
      const updatedUser = {
        id: response.id,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        phone_number: response.phone_number,
        sex: response.sex,
        age_group: response.age_group,
        photo_consent: response.photo_consent,
        status: response.status,
        created_at: response.created_at,
        image_url: response.image_url,
        role: response.role, // Now returns string directly from /users/me
        role_id: response.role_id,
        roles: (response as any).roles, // Array of role names
        permissions: (response as any).permissions, // Array of permissions
      };
      updateUser(updatedUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      throw error;
    }
  }, [updateUser]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
