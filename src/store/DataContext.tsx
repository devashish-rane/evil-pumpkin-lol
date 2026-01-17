import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Attempt, ConceptState, QuestionState, Topic, UserPrefs } from '../models/types';
import { parsePumpkinFile } from '../parser/parsePumpkin';
import {
  computeAtRiskQueue,
  getInitialConceptState,
  getInitialQuestionState
} from '../scheduler/scheduler';
import { readJSON, storageKeys, writeJSON } from '../utils/storage';
import redisRaw from '../../content/redis.pumpkin.txt?raw';
import postgresRaw from '../../content/postgres.pumpkin.txt?raw';
import kafkaRaw from '../../content/kafka.pumpkin.txt?raw';
import kubernetesRaw from '../../content/kubernetes.pumpkin.txt?raw';
import dockerRaw from '../../content/docker.pumpkin.txt?raw';
import httpRaw from '../../content/http.pumpkin.txt?raw';
import typescriptRaw from '../../content/typescript.pumpkin.txt?raw';
import systemDesignRaw from '../../content/system-design.pumpkin.txt?raw';

interface DataContextValue {
  topics: Topic[];
  parseErrors: string[];
  attempts: Attempt[];
  questionStates: QuestionState[];
  conceptStates: ConceptState[];
  prefs: UserPrefs;
  coolStuff: string[];
  addAttempt: (attempt: Attempt) => void;
  updateQuestionState: (state: QuestionState) => void;
  updateConceptState: (state: ConceptState) => void;
  toggleSelectedTopic: (topicId: string) => void;
  removeSelectedTopic: (topicId: string) => void;
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
  const [questionStates, setQuestionStates] = useState<QuestionState[]>(() =>
    readJSON<QuestionState[]>(storageKeys.questionStates, [])
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
    const sources = [
      { source: 'redis', raw: redisRaw },
      { source: 'postgres', raw: postgresRaw },
      { source: 'kafka', raw: kafkaRaw },
      { source: 'kubernetes', raw: kubernetesRaw },
      { source: 'docker', raw: dockerRaw },
      { source: 'http', raw: httpRaw },
      { source: 'typescript', raw: typescriptRaw },
      { source: 'system-design', raw: systemDesignRaw }
    ];
    const parsedTopics = sources.map((entry) => ({
      source: entry.source,
      ...parsePumpkinFile(entry.raw, entry.source)
    }));
    setTopics(parsedTopics.map((parsed) => parsed.topic));
    setParseErrors(
      parsedTopics.flatMap((parsed) => {
        const label = parsed.topic.title || parsed.source;
        return parsed.errors.map((error) => `[${label}] ${error}`);
      })
    );
  }, []);

  useEffect(() => {
    // Persist attempts to survive reloads and enable offline-ish continuity.
    writeJSON(storageKeys.attempts, attempts);
  }, [attempts]);

  useEffect(() => {
    writeJSON(storageKeys.questionStates, questionStates);
  }, [questionStates]);

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

    const updateQuestionState = (state: QuestionState) => {
      setQuestionStates((prev) => {
        const existing = prev.find((item) => item.questionId === state.questionId);
        if (existing) {
          return prev.map((item) =>
            item.questionId === state.questionId ? state : item
          );
        }
        return [...prev, state];
      });
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

    const removeSelectedTopic = (topicId: string) => {
      setPrefs((prev) => ({
        ...prev,
        selectedTopicIds: prev.selectedTopicIds.filter((id) => id !== topicId)
      }));
      const topic = topics.find((item) => item.id === topicId);
      if (!topic) return;
      const questionIdSet = new Set(
        topic.concepts.flatMap((concept) =>
          concept.questions.map((question) => question.id)
        )
      );
      const conceptIdSet = new Set(topic.concepts.map((concept) => concept.id));
      setAttempts((prev) => prev.filter((attempt) => !questionIdSet.has(attempt.questionId)));
      setQuestionStates((prev) =>
        prev.filter((state) => !questionIdSet.has(state.questionId))
      );
      setConceptStates((prev) =>
        prev.filter((state) => !conceptIdSet.has(state.conceptId))
      );
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

    const allQuestionStates = topics.flatMap((topic) =>
      topic.concepts.flatMap((concept) =>
        concept.questions.map((question) => {
          const existing = questionStates.find(
            (item) => item.questionId === question.id
          );
          return existing ?? getInitialQuestionState(question.id);
        })
      )
    );

    return {
      topics,
      parseErrors,
      attempts,
      questionStates: allQuestionStates,
      conceptStates: allStates,
      prefs,
      coolStuff,
      addAttempt,
      updateQuestionState,
      updateConceptState,
      toggleSelectedTopic,
      removeSelectedTopic,
      markGoodQuestion,
      addCuriosity,
      atRiskCount: computeAtRiskQueue(allQuestionStates).length
    };
  }, [attempts, questionStates, conceptStates, prefs, topics, coolStuff]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}
