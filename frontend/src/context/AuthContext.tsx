// src/context/AuthContext.tsx
// Global authentication state.
// Stores the JWT token, decodes the user's role and email from the payload,
// and exposes login / register / logout helpers to all child components.

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

// ─── Types ─────────────────────────────────────────────────────────────────

interface User {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── Context ───────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── JWT Decode Helper ─────────────────────────────────────────────────────

function decodeToken(token: string): User | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

// ─── Provider ──────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token'),
  );
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('token');
    return saved ? decodeToken(saved) : null;
  });

  // Keep localStorage and user state in sync whenever the token changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      setUser(decodeToken(token));
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<void> => {
    const res = await authAPI.login({ email, password });
    setToken(res.data.token);
    toast.success('Welcome back! 👋');
  };

  const register = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    await authAPI.register({ name, email, password });
    toast.success('Account created! Please log in.');
  };

  const googleLogin = async (credential: string): Promise<void> => {
    const res = await authAPI.googleAuth(credential);
    setToken(res.data.token);
    toast.success('Google login successful! 👋');
  };

  const logout = (): void => {
    setToken(null);
    toast.success('Logged out successfully.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.role === 'admin',
        isAuthenticated: !!token,
        login,
        googleLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// Suppress unused import warning — AxiosError is only used for type narrowing
export type { AxiosError };
