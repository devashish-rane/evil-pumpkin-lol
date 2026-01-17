import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Topic } from '../models/content';
import { loadContent } from '../utils/content';

interface ContentState {
  topics: Topic[];
  loading: boolean;
  errors: Array<{ file: string; errors: { message: string; line: number }[] }>;
}

const ContentContext = createContext<ContentState | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [errors, setErrors] = useState<ContentState['errors']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadContent()
      .then((result) => {
        if (!active) return;
        setTopics(result.topics);
        setErrors(result.errors);
      })
      .catch((error) => {
        if (!active) return;
        console.error('Failed to load content', error);
        setErrors([
          {
            file: 'unknown',
            errors: [{ message: 'Unexpected error while loading content.', line: 0 }],
          },
        ]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => ({ topics, errors, loading }), [topics, errors, loading]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within ContentProvider');
  return context;
};
