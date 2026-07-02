"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isPremium: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoaded: boolean;
  isPremium: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoaded: false,
  isPremium: false,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch("/api/user/sync");
      const data = await res.json();
      if (data.user) {
        setUser({ ...data.user, isPremium: !!data.isPremium });
        setIsPremium(!!data.isPremium);
      } else {
        setUser(null);
        setIsPremium(false);
      }
    } catch {
      setUser(null);
      setIsPremium(false);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoaded, isPremium, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
