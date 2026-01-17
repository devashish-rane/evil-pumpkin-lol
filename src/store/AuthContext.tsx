import React, { createContext, useContext, useMemo, useState } from 'react';
import type { StoredUser } from '../models/types';
import { clearKey, readJSON, storageKeys, writeJSON } from '../utils/storage';

interface AuthContextValue {
  user: StoredUser | null;
  login: (email: string, name: string) => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoredUser | null>(() =>
    readJSON<StoredUser | null>(storageKeys.user, null)
  );

  const auth = useMemo<AuthContextValue>(() => {
    const persistUser = (nextUser: StoredUser) => {
      writeJSON(storageKeys.user, nextUser);
      setUser(nextUser);
    };

    return {
      user,
      login: (email, name) => {
        const nextUser = {
          id: crypto.randomUUID(),
          name,
          email,
          token: `token-${Date.now()}`
        };
        persistUser(nextUser);
      },
      signup: (email, name) => {
        const nextUser = {
          id: crypto.randomUUID(),
          name,
          email,
          token: `token-${Date.now()}`
        };
        persistUser(nextUser);
      },
      logout: () => {
        clearKey(storageKeys.user);
        setUser(null);
      }
    };
  }, [user]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
