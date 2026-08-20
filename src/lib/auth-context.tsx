"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthUser, AuthStatus, UserRole } from "@/types";
import * as authService from "@/services/auth";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<authService.AuthResult>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    campusId: string;
    role: UserRole;
    department?: string;
    level?: string;
  }) => Promise<authService.AuthResult>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<authService.AuthResult>;
  verifyOtp: (
    email: string,
    code: string
  ) => Promise<authService.AuthResult>;
  resetPassword: (
    token: string,
    password: string,
    confirmPassword: string
  ) => Promise<authService.AuthResult>;
  resendOtp: (email: string) => Promise<authService.AuthResult>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

const TOKEN_KEY = "kampmax_auth_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // private browsing or quota exceeded
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session on mount
  useEffect(() => {
    const stored = getStoredToken();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }

    authService
      .getCurrentSession(stored)
      .then((result) => {
        if (result.success && result.user && result.token) {
          setUser(result.user);
          setToken(result.token);
          setStoredToken(result.token);
          setStatus("authenticated");
        } else {
          setStoredToken(null);
          setStatus("unauthenticated");
        }
      })
      .catch(() => {
        setStoredToken(null);
        setStatus("unauthenticated");
      });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authService.login({ email, password });
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        setStoredToken(result.token);
        setStatus("authenticated");
      }
      return result;
    },
    []
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
      campusId: string;
      role: UserRole;
      department?: string;
      level?: string;
    }) => {
      const result = await authService.register(data);
      if (result.success && result.user && result.token) {
        setUser(result.user);
        setToken(result.token);
        setStoredToken(result.token);
        setStatus("authenticated");
      }
      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    if (token) await authService.logout(token);
    setUser(null);
    setToken(null);
    setStoredToken(null);
    setStatus("unauthenticated");
  }, [token]);

  const forgotPassword = useCallback(async (email: string) => {
    return authService.forgotPassword({ email });
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    return authService.verifyOtp({ email, code });
  }, []);

  const resetPassword = useCallback(
    async (resetToken: string, password: string, confirmPassword: string) => {
      return authService.resetPassword({
        token: resetToken,
        password,
        confirmPassword,
      });
    },
    []
  );

  const resendOtp = useCallback(async (email: string) => {
    return authService.resendOtp(email);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        token,
        login,
        register,
        logout,
        forgotPassword,
        verifyOtp,
        resetPassword,
        resendOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
