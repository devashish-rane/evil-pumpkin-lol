import { parsePumpkinFile } from '../parser/parsePumpkin';
import type { ParseError, Topic } from '../models/content';

// Load all /content/*.pumpkin.txt files as raw strings.
const contentModules = import.meta.glob('../content/*.pumpkin.txt', { as: 'raw' });

export interface ContentLoadResult {
  topics: Topic[];
  errors: Array<{ file: string; errors: ParseError[] }>;
}

export const loadContent = async (): Promise<ContentLoadResult> => {
  const topics: Topic[] = [];
  const errors: Array<{ file: string; errors: ParseError[] }> = [];

  const entries = Object.entries(contentModules);

  for (const [path, loader] of entries) {
    const raw = await loader();
    const result = parsePumpkinFile(raw as string);
    if (result.topic) {
      topics.push(result.topic);
    }
    if (result.errors.length > 0) {
      errors.push({ file: path.replace('../content/', ''), errors: result.errors });
    }
  }

  return { topics, errors };
};
