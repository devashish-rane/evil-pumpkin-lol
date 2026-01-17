import redisRaw from '../../content/redis.pumpkin.txt?raw';
import { parseTopic } from '../parser/parseTopic';
import type { Topic } from '../models/types';

export interface ContentLoadResult {
  topics: Topic[];
  errors: string[];
}

export const loadTopics = (): ContentLoadResult => {
  const parsed = parseTopic(redisRaw);
  if (parsed.errors.length > 0 || !parsed.topic) {
    return {
      topics: [],
      errors: parsed.errors.map((err) => `Line ${err.line}: ${err.message}`),
    };
  }
  return { topics: [parsed.topic], errors: [] };
};
