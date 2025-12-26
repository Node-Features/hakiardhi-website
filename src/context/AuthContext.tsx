"use client";

import type React from "react";
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/services/auth";
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
  role?: string;
  role_id?: string;
  image_url?: string | null;
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
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
        // First try to get user from localStorage for immediate display
        if (typeof window !== "undefined") {
          const storedUser = localStorage.getItem("user");
          const accessToken = localStorage.getItem("access_token");

          console.log("🔍 AuthContext: Loading user from localStorage");
          console.log("  - storedUser:", storedUser);
          console.log("  - hasToken:", !!accessToken);

          if (storedUser && accessToken) {
            const parsedUser = JSON.parse(storedUser);
            console.log("  - Parsed user:", parsedUser);
            setUser(parsedUser);
          }
        }

        // Then fetch fresh session data from server
        console.log("🔍 AuthContext: Fetching session from server");
        const sessionUser = await getSession();
        console.log("  - Session user:", sessionUser);

        if (sessionUser) {
          setUser(sessionUser);
        } else {
          // If session is invalid, clear user state
          setUser(null);
        }
      } catch (error) {
        console.error("❌ Error loading user session:", error);
        clearSession();
        setUser(null);
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
