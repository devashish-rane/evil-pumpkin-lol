import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { User } from '../models/types';
import { clearStorage, readStorage, writeStorage } from '../utils/storage';

const AUTH_KEY = 'auth:user';

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => readStorage<User | null>(AUTH_KEY, null));

  const login = useCallback(
    (nextUser: User) => {
      // Persisting locally keeps the MVP offline-capable and easy to debug.
      setUser(nextUser);
      writeStorage(AUTH_KEY, nextUser);
      navigate('/', { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(() => {
    // Clearing storage avoids stale sessions when multiple users share a browser.
    setUser(null);
    clearStorage(AUTH_KEY);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
