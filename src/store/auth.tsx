import React, { createContext, useContext, useMemo, useState } from 'react';
import type { User } from '../models/user';
import { loadFromStorage, removeFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_KEY = 'pumpkin_user';

interface AuthContextValue {
  user: User | null;
  login: (email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => loadFromStorage<User | null>(STORAGE_KEY, null));

  const login = (email: string, name: string) => {
    const nextUser = { id: crypto.randomUUID(), email, name };
    setUser(nextUser);
    saveToStorage(STORAGE_KEY, nextUser);
  };

  const logout = () => {
    setUser(null);
    removeFromStorage(STORAGE_KEY);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
