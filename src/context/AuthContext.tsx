'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { insforge } from '@/lib/insforge';

type AuthUser = {
  id: string;
  email: string;
  profile?: { name?: string; avatar_url?: string };
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  setUser: (user: AuthUser | null) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    insforge.auth.refreshSession().then(({ data }) => {
      if (data?.user) {
        setUser(data.user as AuthUser);
      }
      setLoading(false);
    }).catch(() => {
      // No active session — expected on first load
      setLoading(false);
    });
  }, []);

  const signOut = async () => {
    await insforge.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
