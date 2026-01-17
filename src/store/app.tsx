import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Attempt, ConceptState, UserPrefs } from '../models/user';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const STORAGE_STATE = 'pumpkin_concept_states';
const STORAGE_ATTEMPTS = 'pumpkin_attempts';
const STORAGE_PREFS = 'pumpkin_prefs';

interface AppContextValue {
  conceptStates: ConceptState[];
  attempts: Attempt[];
  prefs: UserPrefs;
  updateConceptState: (update: ConceptState) => void;
  addAttempt: (attempt: Attempt) => void;
  updatePrefs: (update: Partial<UserPrefs>) => void;
}

const DEFAULT_PREFS: UserPrefs = {
  selectedTopics: [],
  streakCount: 0,
  memoryDebt: 0,
  curiositiesViewed: [],
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conceptStates, setConceptStates] = useState<ConceptState[]>(() =>
    loadFromStorage<ConceptState[]>(STORAGE_STATE, [])
  );
  const [attempts, setAttempts] = useState<Attempt[]>(() =>
    loadFromStorage<Attempt[]>(STORAGE_ATTEMPTS, [])
  );
  const [prefs, setPrefs] = useState<UserPrefs>(() => loadFromStorage<UserPrefs>(STORAGE_PREFS, DEFAULT_PREFS));

  const updateConceptState = (update: ConceptState) => {
    setConceptStates((prev) => {
      const next = prev.filter((state) => state.conceptId !== update.conceptId).concat(update);
      saveToStorage(STORAGE_STATE, next);
      return next;
    });
  };

  const addAttempt = (attempt: Attempt) => {
    setAttempts((prev) => {
      const next = [attempt, ...prev].slice(0, 400);
      saveToStorage(STORAGE_ATTEMPTS, next);
      return next;
    });
  };

  const updatePrefs = (update: Partial<UserPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...update };
      saveToStorage(STORAGE_PREFS, next);
      return next;
    });
  };

  const value = useMemo(
    () => ({ conceptStates, attempts, prefs, updateConceptState, addAttempt, updatePrefs }),
    [conceptStates, attempts, prefs]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
};
