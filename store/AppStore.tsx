import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { parseTopicFile } from "../parser/parseTopicFile";
import { Attempt, ConceptState, Topic, UserPrefs, UserProfile } from "../models/types";
import { loadFromStorage, saveToStorage } from "./storage";
import { computeNextReviewAt, computeSchedulerSummary, promoteMastery } from "../scheduler/reviewScheduler";
import redisContent from "../content/redis.pumpkin.txt?raw";

const STORAGE_KEYS = {
  user: "pumpkin:user",
  prefs: "pumpkin:prefs",
  attempts: "pumpkin:attempts",
  states: "pumpkin:states"
};

interface AppStoreState {
  topic: Topic | null;
  parseError: string | null;
  user: UserProfile | null;
  prefs: UserPrefs;
  conceptStates: Record<string, ConceptState>;
  attempts: Attempt[];
  schedulerSummary: ReturnType<typeof computeSchedulerSummary> | null;
  signup: (name: string, email: string) => void;
  login: (email: string) => void;
  logout: () => void;
  toggleSelectedTopic: (topicId: string) => void;
  recordAttempt: (attempt: Attempt) => void;
  signalGoodQuestion: (conceptId: string) => void;
  markCoolStuffSeen: (factId: string) => void;
}

const AppStoreContext = createContext<AppStoreState | null>(null);

const defaultPrefs: UserPrefs = {
  selectedTopics: [],
  coolStuffSeen: []
};

const initConceptStates = (topic: Topic): Record<string, ConceptState> => {
  const states: Record<string, ConceptState> = {};
  topic.concepts.forEach((concept) => {
    states[concept.id] = {
      conceptId: concept.id,
      mastery: "Exposed",
      nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      goodQuestionSignals: 0,
      failures: 0
    };
  });
  return states;
};

const mergeConceptStates = (
  topic: Topic,
  existing: Record<string, ConceptState>
): Record<string, ConceptState> => {
  const merged = { ...existing };
  topic.concepts.forEach((concept) => {
    if (!merged[concept.id]) {
      merged[concept.id] = {
        conceptId: concept.id,
        mastery: "Exposed",
        nextReviewAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        goodQuestionSignals: 0,
        failures: 0
      };
    }
  });
  return merged;
};

export const AppStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(() => loadFromStorage(STORAGE_KEYS.user, null));
  const [prefs, setPrefs] = useState<UserPrefs>(() => loadFromStorage(STORAGE_KEYS.prefs, defaultPrefs));
  const [attempts, setAttempts] = useState<Attempt[]>(() => loadFromStorage(STORAGE_KEYS.attempts, []));
  const [conceptStates, setConceptStates] = useState<Record<string, ConceptState>>({});

  useEffect(() => {
    try {
      const parsed = parseTopicFile(redisContent);
      setTopic(parsed);
      setConceptStates((existing) => {
        if (Object.keys(existing).length > 0) {
          return mergeConceptStates(parsed, existing);
        }
        const stored = loadFromStorage(STORAGE_KEYS.states, initConceptStates(parsed));
        return mergeConceptStates(parsed, stored);
      });
      setParseError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown parser error";
      setParseError(message);
    }
  }, []);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.user, user);
  }, [user]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.prefs, prefs);
  }, [prefs]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.attempts, attempts);
  }, [attempts]);

  useEffect(() => {
    if (Object.keys(conceptStates).length > 0) {
      saveToStorage(STORAGE_KEYS.states, conceptStates);
    }
  }, [conceptStates]);

  const signup = (name: string, email: string) => {
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date().toISOString()
    };
    setUser(profile);
  };

  const login = (email: string) => {
    const profile = loadFromStorage<UserProfile | null>(STORAGE_KEYS.user, null);
    if (profile && profile.email === email) {
      setUser(profile);
      return;
    }
    setUser({
      id: `user-${Date.now()}`,
      email,
      name: email.split("@")[0] ?? "Learner",
      createdAt: new Date().toISOString()
    });
  };

  const logout = () => {
    setUser(null);
  };

  const toggleSelectedTopic = (topicId: string) => {
    setPrefs((current) => {
      const exists = current.selectedTopics.includes(topicId);
      return {
        ...current,
        selectedTopics: exists
          ? current.selectedTopics.filter((id) => id !== topicId)
          : [...current.selectedTopics, topicId]
      };
    });
  };

  const recordAttempt = (attempt: Attempt) => {
    setAttempts((current) => [attempt, ...current].slice(0, 500));
    setConceptStates((current) => {
      const state = current[attempt.conceptId];
      if (!state) {
        return current;
      }

      const mastery = promoteMastery(state.mastery, attempt.correct);
      const nextReviewAt = computeNextReviewAt(mastery, attempt.correct);

      return {
        ...current,
        [attempt.conceptId]: {
          ...state,
          mastery,
          nextReviewAt,
          lastAttemptAt: attempt.timestamp,
          failures: attempt.correct ? state.failures : state.failures + 1
        }
      };
    });
  };

  const signalGoodQuestion = (conceptId: string) => {
    setConceptStates((current) => {
      const state = current[conceptId];
      if (!state) return current;
      return {
        ...current,
        [conceptId]: {
          ...state,
          goodQuestionSignals: state.goodQuestionSignals + 1
        }
      };
    });
  };

  const markCoolStuffSeen = (factId: string) => {
    setPrefs((current) => ({
      ...current,
      coolStuffSeen: current.coolStuffSeen.includes(factId)
        ? current.coolStuffSeen
        : [...current.coolStuffSeen, factId]
    }));
  };

  const schedulerSummary = useMemo(() => {
    return computeSchedulerSummary(Object.values(conceptStates));
  }, [conceptStates]);

  const value: AppStoreState = {
    topic,
    parseError,
    user,
    prefs,
    conceptStates,
    attempts,
    schedulerSummary,
    signup,
    login,
    logout,
    toggleSelectedTopic,
    recordAttempt,
    signalGoodQuestion,
    markCoolStuffSeen
  };

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
};

export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error("useAppStore must be used within AppStoreProvider");
  }
  return context;
};
