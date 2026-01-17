import type { Concept, Question, Topic } from '../models/types';

interface ParseResult {
  topic: Topic;
  errors: string[];
}

interface TempQuestion {
  type?: string;
  prompt?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  tags?: string[];
  misconception?: string;
  difficulty?: number;
  variantGroup?: string;
  items?: string[];
  blanks?: string[];
  reasonPrompt?: string;
  reasonOptions?: string[];
  lineStart?: number;
}

// Required topic headers to prevent silent content drift if humans edit files by hand.
const REQUIRED_TOPIC_FIELDS = ['#TOPIC', '#DESC'] as const;

type RequiredTopicField = (typeof REQUIRED_TOPIC_FIELDS)[number];

function parseError(line: number, message: string): string {
  return `Line ${line}: ${message}`;
}

// Normalizes unknown fields to offer deterministic error reporting.
function normalizeField(line: string): { key: string; value: string } | null {
  const match = line.match(/^([A-Z#_]+):\s*(.*)$/);
  if (!match) return null;
  return { key: match[1], value: match[2] };
}

// Strict option parsing to keep human-authored files diff-friendly and deterministic.
function parseOptions(prefix: string, line: string): string | null {
  const match = line.match(new RegExp(`^${prefix}\\)\\s*(.*)$`));
  return match ? match[1] : null;
}

export function parsePumpkinFile(
  raw: string,
  sourceName: string
): ParseResult {
  const lines = raw.split(/\r?\n/);
  const errors: string[] = [];
  let topicTitle = '';
  let topicDesc = '';
  let currentConcept: Concept | null = null;
  let currentQuestion: TempQuestion | null = null;
  const concepts: Concept[] = [];
  const seenTopicFields = new Set<RequiredTopicField>();

  const flushQuestion = () => {
    if (!currentQuestion || !currentConcept) return;
    const line = currentQuestion.lineStart ?? 0;
    const type = (currentQuestion.type ?? 'MCQ') as Question['type'];

    // Validate per-type constraints to surface malformed content early.
    if (!currentQuestion.prompt) {
      errors.push(parseError(line, 'Question missing Q: prompt.'));
    }
    if (!currentQuestion.answer) {
      errors.push(parseError(line, 'Question missing ANS: field.'));
    }
    if (!currentQuestion.explanation) {
      errors.push(parseError(line, 'Question missing EXPL: field.'));
    }

    if (type === 'MCQ' || type === 'TWO_STEP') {
      if (!currentQuestion.options || currentQuestion.options.length !== 4) {
        errors.push(parseError(line, 'MCQ requires four options A-D.'));
      }
    }

    if (type === 'TWO_STEP') {
      if (!currentQuestion.reasonPrompt) {
        errors.push(parseError(line, 'TWO_STEP requires REASON: prompt.'));
      }
      if (!currentQuestion.reasonOptions || currentQuestion.reasonOptions.length !== 4) {
        errors.push(parseError(line, 'TWO_STEP requires REASON_A-D options.'));
      }
    }

    if (type === 'ORDER' && (!currentQuestion.items || currentQuestion.items.length < 2)) {
      errors.push(parseError(line, 'ORDER requires ITEMS list with at least two entries.'));
    }

    if (type === 'FILL' && (!currentQuestion.blanks || currentQuestion.blanks.length === 0)) {
      errors.push(parseError(line, 'FILL requires BLANK field.'));
    }

    const question: Question = {
      id: `${currentConcept.id}-${currentConcept.questions.length + 1}`,
      conceptId: currentConcept.id,
      type,
      prompt: currentQuestion.prompt ?? '',
      options: currentQuestion.options,
      answer: currentQuestion.answer ?? '',
      explanation: currentQuestion.explanation ?? '',
      tags: currentQuestion.tags ?? [],
      misconception: currentQuestion.misconception,
      difficulty: currentQuestion.difficulty ?? 1,
      variantGroup: currentQuestion.variantGroup,
      items: currentQuestion.items,
      blanks: currentQuestion.blanks,
      reasonPrompt: currentQuestion.reasonPrompt,
      reasonOptions: currentQuestion.reasonOptions
    };
    currentConcept.questions.push(question);
    currentQuestion = null;
  };

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    const lineNumber = index + 1;
    const line = rawLine.trim();

    if (!line) continue;

    if (line === '---') {
      flushQuestion();
      continue;
    }

    if (line.startsWith('#TOPIC:')) {
      topicTitle = line.replace('#TOPIC:', '').trim();
      seenTopicFields.add('#TOPIC');
      continue;
    }

    if (line.startsWith('#DESC:')) {
      topicDesc = line.replace('#DESC:', '').trim();
      seenTopicFields.add('#DESC');
      continue;
    }

    if (line.startsWith('##CONCEPT:')) {
      flushQuestion();
      const title = line.replace('##CONCEPT:', '').trim();
      currentConcept = {
        id: `${sourceName}-${concepts.length + 1}`,
        title,
        summary: '',
        prereq: [],
        questions: []
      };
      concepts.push(currentConcept);
      continue;
    }

    if (!currentConcept) {
      errors.push(parseError(lineNumber, 'Content before first ##CONCEPT.'));
      continue;
    }

    if (line.startsWith('##PREREQ:')) {
      const prereqRaw = line.replace('##PREREQ:', '').trim();
      currentConcept.prereq = prereqRaw
        ? prereqRaw.split(',').map((item) => item.trim())
        : [];
      continue;
    }

    if (line.startsWith('##SUMMARY:')) {
      currentConcept.summary = line.replace('##SUMMARY:', '').trim();
      continue;
    }

    if (line.startsWith('Q:')) {
      if (!currentQuestion) {
        currentQuestion = {
          prompt: line.replace('Q:', '').trim(),
          lineStart: lineNumber
        };
      } else {
        currentQuestion.prompt = line.replace('Q:', '').trim();
      }
      continue;
    }

    if (!currentQuestion) {
      if (line.startsWith('TYPE:')) {
        currentQuestion = {
          type: line.replace('TYPE:', '').trim(),
          lineStart: lineNumber
        };
        continue;
      }
      errors.push(parseError(lineNumber, 'Line outside question block.'));
      continue;
    }

    const aOption = parseOptions('A', line);
    const bOption = parseOptions('B', line);
    const cOption = parseOptions('C', line);
    const dOption = parseOptions('D', line);
    const reasonA = parseOptions('REASON_A', line);
    const reasonB = parseOptions('REASON_B', line);
    const reasonC = parseOptions('REASON_C', line);
    const reasonD = parseOptions('REASON_D', line);

    if (aOption || bOption || cOption || dOption) {
      currentQuestion.options = currentQuestion.options ?? [];
      const option = aOption ?? bOption ?? cOption ?? dOption;
      currentQuestion.options.push(option ?? '');
      continue;
    }

    if (reasonA || reasonB || reasonC || reasonD) {
      currentQuestion.reasonOptions = currentQuestion.reasonOptions ?? [];
      const option = reasonA ?? reasonB ?? reasonC ?? reasonD;
      currentQuestion.reasonOptions.push(option ?? '');
      continue;
    }

    if (line.startsWith('TYPE:')) {
      currentQuestion.type = line.replace('TYPE:', '').trim();
      continue;
    }

    if (line.startsWith('REASON:')) {
      currentQuestion.reasonPrompt = line.replace('REASON:', '').trim();
      continue;
    }

    if (line.startsWith('ANS:')) {
      currentQuestion.answer = line.replace('ANS:', '').trim();
      continue;
    }

    if (line.startsWith('EXPL:')) {
      currentQuestion.explanation = line.replace('EXPL:', '').trim();
      continue;
    }

    if (line.startsWith('TAGS:')) {
      currentQuestion.tags = line
        .replace('TAGS:', '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      continue;
    }

    if (line.startsWith('MISCONCEPT:')) {
      currentQuestion.misconception = line.replace('MISCONCEPT:', '').trim();
      continue;
    }

    if (line.startsWith('DIFF:')) {
      const diffValue = Number(line.replace('DIFF:', '').trim());
      currentQuestion.difficulty = Number.isFinite(diffValue) ? diffValue : 1;
      continue;
    }

    if (line.startsWith('VAR:')) {
      currentQuestion.variantGroup = line.replace('VAR:', '').trim();
      continue;
    }

    if (line.startsWith('BLANK:')) {
      currentQuestion.blanks = line
        .replace('BLANK:', '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
      continue;
    }

    if (line.startsWith('ITEMS:')) {
      currentQuestion.items = [];
      continue;
    }

    if (currentQuestion.items && /^\d+\)/.test(line)) {
      currentQuestion.items.push(line.replace(/^\d+\)/, '').trim());
      continue;
    }

    const normalized = normalizeField(line);
    if (normalized) {
      errors.push(parseError(lineNumber, `Unknown field ${normalized.key}.`));
      continue;
    }

    errors.push(parseError(lineNumber, 'Unrecognized line in question.'));
  }

  flushQuestion();

  REQUIRED_TOPIC_FIELDS.forEach((field) => {
    if (!seenTopicFields.has(field)) {
      errors.push(parseError(1, `${field} is required.`));
    }
  });

  if (!topicTitle || !topicDesc) {
    errors.push(parseError(1, 'Topic title and description are required.'));
  }

  if (concepts.length === 0) {
    errors.push(parseError(1, 'At least one concept is required.'));
  }

  const topic: Topic = {
    id: sourceName,
    title: topicTitle,
    description: topicDesc,
    concepts
  };

  return { topic, errors };
}
