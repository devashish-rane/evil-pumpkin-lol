import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Attempt, ConceptState, UserPrefs } from '../models/types';
import { readStorage, writeStorage } from '../utils/storage';

const PREFS_KEY = 'prefs';
const ATTEMPTS_KEY = 'attempts';
const CONCEPT_STATE_KEY = 'conceptStates';

interface LearningState {
  prefs: UserPrefs;
  setPrefs: (prefs: UserPrefs) => void;
  attempts: Attempt[];
  setAttempts: (attempts: Attempt[]) => void;
  conceptStates: ConceptState[];
  setConceptStates: (states: ConceptState[]) => void;
}

const defaultPrefs: UserPrefs = {
  selectedTopicIds: [],
  curiosities: [],
};

const LearningContext = createContext<LearningState | null>(null);

export const LearningProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefsState] = useState<UserPrefs>(() => readStorage(PREFS_KEY, defaultPrefs));
  const [attempts, setAttemptsState] = useState<Attempt[]>(() => readStorage(ATTEMPTS_KEY, []));
  const [conceptStates, setConceptStatesState] = useState<ConceptState[]>(() =>
    readStorage(CONCEPT_STATE_KEY, [])
  );

  const setPrefs = (nextPrefs: UserPrefs) => {
    // Keep localStorage as the single source of truth for the MVP to avoid sync bugs.
    setPrefsState(nextPrefs);
    writeStorage(PREFS_KEY, nextPrefs);
  };

  const setAttempts = (nextAttempts: Attempt[]) => {
    setAttemptsState(nextAttempts);
    writeStorage(ATTEMPTS_KEY, nextAttempts);
  };

  const setConceptStates = (nextStates: ConceptState[]) => {
    setConceptStatesState(nextStates);
    writeStorage(CONCEPT_STATE_KEY, nextStates);
  };

  const value = useMemo(
    () => ({ prefs, setPrefs, attempts, setAttempts, conceptStates, setConceptStates }),
    [prefs, attempts, conceptStates]
  );

  return <LearningContext.Provider value={value}>{children}</LearningContext.Provider>;
};

export const useLearning = (): LearningState => {
  const ctx = useContext(LearningContext);
  if (!ctx) {
    throw new Error('useLearning must be used inside LearningProvider');
  }
  return ctx;
};
