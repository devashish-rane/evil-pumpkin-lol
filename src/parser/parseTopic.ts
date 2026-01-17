import type { Concept, Question, QuestionOption, QuestionType, Topic } from '../models/types';

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  topic?: Topic;
  errors: ParseError[];
}

interface WorkingConcept {
  concept: Concept;
  questions: Question[];
}

// Slugify keeps IDs stable and ensures prereq references are case-insensitive.
const slugify = (value: string): string => value.toLowerCase().replace(/\s+/g, '-');

const ensure = (condition: boolean, errors: ParseError[], line: number, message: string): boolean => {
  if (!condition) {
    errors.push({ line, message });
  }
  return condition;
};

// Options are strict A-D lines; this makes the format diff-friendly and predictable for validators.
const parseOptions = (lines: string[], startLine: number): { options: QuestionOption[]; nextIndex: number } => {
  const options: QuestionOption[] = [];
  let index = startLine;
  for (let i = 0; i < 4; i += 1) {
    const line = lines[index];
    if (!line || !/^[A-D]\)/.test(line)) {
      break;
    }
    const [key, ...rest] = line.split(')');
    options.push({ key: key.trim(), text: rest.join(')').trim() });
    index += 1;
  }
  return { options, nextIndex: index };
};

// ORDER questions use numbered items to avoid ambiguity and keep ordering explicit.
const parseItems = (lines: string[], startLine: number): { items: string[]; nextIndex: number } => {
  const items: string[] = [];
  let index = startLine;
  while (index < lines.length && /^\d+\)/.test(lines[index])) {
    const [, ...rest] = lines[index].split(')');
    items.push(rest.join(')').trim());
    index += 1;
  }
  return { items, nextIndex: index };
};

export const parseTopic = (raw: string): ParseResult => {
  const lines = raw.split(/\r?\n/);
  const errors: ParseError[] = [];

  let topicName = '';
  let topicDescription = '';
  let currentConcept: WorkingConcept | null = null;
  const concepts: Concept[] = [];

  const flushConcept = () => {
    if (currentConcept) {
      concepts.push({ ...currentConcept.concept, questions: currentConcept.questions });
    }
  };

  // Line-by-line parsing avoids regex-heavy parsing and makes it easier to return actionable line numbers.
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i += 1;
      continue;
    }

    if (line.startsWith('#TOPIC:')) {
      topicName = line.replace('#TOPIC:', '').trim();
      ensure(topicName.length > 0, errors, i + 1, 'Topic name cannot be empty.');
      i += 1;
      continue;
    }

    if (line.startsWith('#DESC:')) {
      topicDescription = line.replace('#DESC:', '').trim();
      ensure(topicDescription.length > 0, errors, i + 1, 'Topic description cannot be empty.');
      i += 1;
      continue;
    }

    if (line.startsWith('##CONCEPT:')) {
      flushConcept();
      const name = line.replace('##CONCEPT:', '').trim();
      currentConcept = {
        concept: {
          id: slugify(name),
          name,
          prereqs: [],
          summary: undefined,
          questions: [],
        },
        questions: [],
      };
      ensure(name.length > 0, errors, i + 1, 'Concept name cannot be empty.');
      i += 1;
      continue;
    }

    if (line.startsWith('##PREREQ:')) {
      if (!currentConcept) {
        errors.push({ line: i + 1, message: 'Prerequisite defined before a concept.' });
        i += 1;
        continue;
      }
      const prereqLine = line.replace('##PREREQ:', '').trim();
      currentConcept.concept.prereqs = prereqLine
        ? prereqLine.split(',').map((item) => slugify(item.trim()))
        : [];
      i += 1;
      continue;
    }

    if (line.startsWith('##SUMMARY:')) {
      if (!currentConcept) {
        errors.push({ line: i + 1, message: 'Summary defined before a concept.' });
        i += 1;
        continue;
      }
      currentConcept.concept.summary = line.replace('##SUMMARY:', '').trim();
      i += 1;
      continue;
    }

    if (line.startsWith('Q:')) {
      if (!currentConcept) {
        errors.push({ line: i + 1, message: 'Question defined before a concept.' });
        i += 1;
        continue;
      }

      const prompt = line.replace('Q:', '').trim();
      const question: Question = {
        id: `q-${currentConcept.questions.length + 1}-${currentConcept.concept.id}`,
        type: 'MCQ',
        prompt,
        answer: '',
        explanation: '',
        tags: [],
      };

      i += 1;
      // TYPE must appear directly after Q: to keep the format deterministic.
      if (lines[i]?.startsWith('TYPE:')) {
        question.type = lines[i].replace('TYPE:', '').trim() as QuestionType;
        i += 1;
      }

      if (question.type === 'ORDER') {
        ensure(lines[i]?.startsWith('ITEMS:'), errors, i + 1, 'ORDER questions require ITEMS.');
        i += 1;
        const { items, nextIndex } = parseItems(lines, i);
        question.items = items;
        i = nextIndex;
      }

      if (question.type === 'FILL') {
        ensure(lines[i]?.startsWith('BLANK:'), errors, i + 1, 'FILL questions require BLANK.');
        if (lines[i]?.startsWith('BLANK:')) {
          question.blanks = lines[i].replace('BLANK:', '').split(',').map((item) => item.trim());
          i += 1;
        }
      }

      const { options, nextIndex } = parseOptions(lines, i);
      if (options.length) {
        question.options = options;
        i = nextIndex;
      }

      while (i < lines.length && !lines[i].startsWith('---') && !lines[i].startsWith('Q:')) {
        const current = lines[i];
        if (current.startsWith('ANS:')) {
          question.answer = current.replace('ANS:', '').trim();
        } else if (current.startsWith('EXPL:')) {
          question.explanation = current.replace('EXPL:', '').trim();
        } else if (current.startsWith('TAGS:')) {
          question.tags = current
            .replace('TAGS:', '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
        } else if (current.startsWith('MISCONCEPT:')) {
          question.misconception = current.replace('MISCONCEPT:', '').trim();
        } else if (current.startsWith('DIFF:')) {
          question.difficulty = Number(current.replace('DIFF:', '').trim());
        } else if (current.startsWith('VAR:')) {
          question.variant = current.replace('VAR:', '').trim();
        } else if (current.startsWith('REASON_OPTIONS:')) {
          const reasonOptions = current
            .replace('REASON_OPTIONS:', '')
            .split('|')
            .map((item, idx) => ({ key: String.fromCharCode(65 + idx), text: item.trim() }));
          question.reasonOptions = reasonOptions;
        } else if (current.startsWith('REASON_ANS:')) {
          question.reasonAnswer = current.replace('REASON_ANS:', '').trim();
        }
        i += 1;
      }

      ensure(question.explanation.length > 0, errors, i + 1, 'Question explanation is required.');
      ensure(question.answer !== '', errors, i + 1, 'Question answer is required.');

      currentConcept.questions.push(question);

      if (lines[i]?.startsWith('---')) {
        i += 1;
      }
      continue;
    }

    errors.push({ line: i + 1, message: `Unexpected line: ${line}` });
    i += 1;
  }

  flushConcept();

  ensure(topicName.length > 0, errors, 1, 'Missing #TOPIC declaration.');
  ensure(topicDescription.length > 0, errors, 2, 'Missing #DESC declaration.');

  if (errors.length) {
    return { errors };
  }

  return {
    errors,
    topic: {
      id: slugify(topicName),
      name: topicName,
      description: topicDescription,
      concepts,
    },
  };
};
