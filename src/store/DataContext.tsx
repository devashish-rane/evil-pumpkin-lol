import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Attempt, ConceptState, Topic, UserPrefs } from '../models/types';
import { parsePumpkinFile } from '../parser/parsePumpkin';
import { computeAtRiskQueue, getInitialConceptState } from '../scheduler/scheduler';
import { readJSON, storageKeys, writeJSON } from '../utils/storage';
import redisRaw from '../../content/redis.pumpkin.txt?raw';

interface DataContextValue {
  topics: Topic[];
  parseErrors: string[];
  attempts: Attempt[];
  conceptStates: ConceptState[];
  prefs: UserPrefs;
  coolStuff: string[];
  addAttempt: (attempt: Attempt) => void;
  updateConceptState: (state: ConceptState) => void;
  toggleSelectedTopic: (topicId: string) => void;
  markGoodQuestion: (conceptId: string) => void;
  addCuriosity: (fact: string) => void;
  atRiskCount: number;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

const initialPrefs: UserPrefs = {
  selectedTopicIds: [],
  curiositySeen: []
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>(() =>
    readJSON<Attempt[]>(storageKeys.attempts, [])
  );
  const [conceptStates, setConceptStates] = useState<ConceptState[]>(() =>
    readJSON<ConceptState[]>(storageKeys.conceptStates, [])
  );
  const [prefs, setPrefs] = useState<UserPrefs>(() =>
    readJSON<UserPrefs>(storageKeys.prefs, initialPrefs)
  );
  const [coolStuff, setCoolStuff] = useState<string[]>(() =>
    readJSON<string[]>(storageKeys.coolStuff, [])
  );

  useEffect(() => {
    // Load content once to avoid reparsing on every render and to keep errors stable.
    const parsed = parsePumpkinFile(redisRaw, 'redis');
    setTopics([parsed.topic]);
    setParseErrors(parsed.errors);
  }, []);

  useEffect(() => {
    // Persist attempts to survive reloads and enable offline-ish continuity.
    writeJSON(storageKeys.attempts, attempts);
  }, [attempts]);

  useEffect(() => {
    // Concept states are the scheduler's source of truth; keep them durable.
    writeJSON(storageKeys.conceptStates, conceptStates);
  }, [conceptStates]);

  useEffect(() => {
    // Preferences are lightweight and safe to store in localStorage for the MVP.
    writeJSON(storageKeys.prefs, prefs);
  }, [prefs]);

  useEffect(() => {
    // Curiosities are small but meaningful; store them so learners can revisit wins.
    writeJSON(storageKeys.coolStuff, coolStuff);
  }, [coolStuff]);

  const value = useMemo<DataContextValue>(() => {
    const addAttempt = (attempt: Attempt) => {
      setAttempts((prev) => [...prev, attempt]);
    };

    const updateConceptState = (state: ConceptState) => {
      setConceptStates((prev) => {
        const existing = prev.find((item) => item.conceptId === state.conceptId);
        if (existing) {
          return prev.map((item) =>
            item.conceptId === state.conceptId ? state : item
          );
        }
        return [...prev, state];
      });
    };

    const toggleSelectedTopic = (topicId: string) => {
      setPrefs((prev) => {
        const has = prev.selectedTopicIds.includes(topicId);
        return {
          ...prev,
          selectedTopicIds: has
            ? prev.selectedTopicIds.filter((id) => id !== topicId)
            : [...prev.selectedTopicIds, topicId]
        };
      });
    };

    const markGoodQuestion = (conceptId: string) => {
      setConceptStates((prev) => {
        const found = prev.find((item) => item.conceptId === conceptId);
        if (!found) {
          return [...prev, { ...getInitialConceptState(conceptId), goodQuestionSignal: 1 }];
        }
        return prev.map((item) =>
          item.conceptId === conceptId
            ? { ...item, goodQuestionSignal: item.goodQuestionSignal + 1 }
            : item
        );
      });
    };

    const addCuriosity = (fact: string) => {
      // Avoid duplicates to prevent noisy lists and keep the viewed list deterministic.
      setCoolStuff((prev) => (prev.includes(fact) ? prev : [...prev, fact]));
    };

    const allStates = topics.flatMap((topic) =>
      topic.concepts.map((concept) => {
        const existing = conceptStates.find(
          (item) => item.conceptId === concept.id
        );
        return existing ?? getInitialConceptState(concept.id);
      })
    );

    return {
      topics,
      parseErrors,
      attempts,
      conceptStates: allStates,
      prefs,
      coolStuff,
      addAttempt,
      updateConceptState,
      toggleSelectedTopic,
      markGoodQuestion,
      addCuriosity,
      atRiskCount: computeAtRiskQueue(allStates).length
    };
  }, [attempts, conceptStates, prefs, topics, coolStuff]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
