import type { Concept, ParseError, Question, Topic } from '../models/content';

const FIELD_PREFIXES = [
  'ANS:',
  'EXPL:',
  'TAGS:',
  'MISCONCEPT:',
  'DIFF:',
  'VAR:',
  'TYPE:',
  'REASON:',
  'REASON_ANS:',
  'BLANK:',
  'ITEMS:',
];

const isFieldLine = (line: string) =>
  FIELD_PREFIXES.some((prefix) => line.startsWith(prefix));

const isOptionLine = (line: string) => /^[A-D]\)/.test(line.trim());
const isReasonOptionLine = (line: string) => /^R[A-D]\)/.test(line.trim());

interface QuestionDraft {
  type: Question['type'];
  prompt?: string;
  options: string[];
  answer?: string;
  explanation?: string;
  tags: string[];
  misconception?: string;
  difficulty?: number;
  variant?: string;
  reasonPrompt?: string;
  reasonOptions: string[];
  reasonAnswer?: string;
  items: string[];
  blanks: string[];
  line: number;
}

const createDraft = (line: number): QuestionDraft => ({
  type: 'MCQ',
  options: [],
  tags: [],
  reasonOptions: [],
  items: [],
  blanks: [],
  line,
});

const normalizeId = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const parsePumpkinFile = (raw: string): { topic?: Topic; errors: ParseError[] } => {
  const errors: ParseError[] = [];
  const lines = raw.split(/\r?\n/);

  const addError = (message: string, line: number) => {
    errors.push({ message, line });
  };

  let topicTitle = '';
  let topicDesc = '';
  let lineIndex = 0;

  const nextNonEmpty = () => {
    while (lineIndex < lines.length) {
      const line = lines[lineIndex].trim();
      if (line.length === 0) {
        lineIndex += 1;
        continue;
      }
      return line;
    }
    return null;
  };

  // Parse header.
  const firstLine = nextNonEmpty();
  if (!firstLine || !firstLine.startsWith('#TOPIC:')) {
    addError('Missing #TOPIC header.', 1);
  } else {
    topicTitle = firstLine.replace('#TOPIC:', '').trim();
    if (!topicTitle) {
      addError('Topic title cannot be empty.', lineIndex + 1);
    }
    lineIndex += 1;
  }

  const secondLine = nextNonEmpty();
  if (!secondLine || !secondLine.startsWith('#DESC:')) {
    addError('Missing #DESC header.', lineIndex + 1);
  } else {
    topicDesc = secondLine.replace('#DESC:', '').trim();
    if (!topicDesc) {
      addError('Topic description cannot be empty.', lineIndex + 1);
    }
    lineIndex += 1;
  }

  const concepts: Concept[] = [];
  let currentConcept: Concept | null = null;
  let currentQuestion: QuestionDraft | null = null;
  let questionIndex = 0;
  let pendingType: QuestionDraft['type'] | null = null;
  let itemsMode = false;

  const finalizeQuestion = () => {
    if (!currentConcept || !currentQuestion) return;

    if (!currentQuestion.prompt) {
      addError('Question is missing prompt (Q:).', currentQuestion.line);
      return;
    }

    if (!currentQuestion.answer) {
      addError('Question is missing ANS.', currentQuestion.line);
      return;
    }

    if (!currentQuestion.explanation) {
      addError('Question is missing EXPL.', currentQuestion.line);
      return;
    }

    if (currentQuestion.type === 'MCQ') {
      if (currentQuestion.options.length !== 4) {
        addError('MCQ must include exactly 4 options (A-D).', currentQuestion.line);
        return;
      }
    }

    if (currentQuestion.type === 'TWO_STEP') {
      if (currentQuestion.options.length !== 4) {
        addError('TWO_STEP must include exactly 4 options (A-D).', currentQuestion.line);
        return;
      }
      if (!currentQuestion.reasonPrompt) {
        addError('TWO_STEP missing REASON prompt.', currentQuestion.line);
        return;
      }
      if (currentQuestion.reasonOptions.length !== 4) {
        addError('TWO_STEP must include exactly 4 reason options (RA-RD).', currentQuestion.line);
        return;
      }
      if (!currentQuestion.reasonAnswer) {
        addError('TWO_STEP missing REASON_ANS.', currentQuestion.line);
        return;
      }
    }

    if (currentQuestion.type === 'ORDER') {
      if (currentQuestion.items.length < 3) {
        addError('ORDER questions need at least 3 items.', currentQuestion.line);
        return;
      }
    }

    if (currentQuestion.type === 'FILL') {
      if (currentQuestion.blanks.length === 0) {
        addError('FILL questions require BLANK.', currentQuestion.line);
        return;
      }
    }

    const question: Question = {
      id: `${currentConcept.id}-q${questionIndex + 1}`,
      type: currentQuestion.type,
      prompt: currentQuestion.prompt,
      options: currentQuestion.options,
      answer: currentQuestion.answer,
      explanation: currentQuestion.explanation,
      tags: currentQuestion.tags,
      misconception: currentQuestion.misconception,
      difficulty: currentQuestion.difficulty,
      variant: currentQuestion.variant,
    } as Question;

    if (currentQuestion.type === 'TWO_STEP') {
      (question as Question).reasonPrompt = currentQuestion.reasonPrompt!;
      (question as Question).reasonOptions = currentQuestion.reasonOptions;
      (question as Question).reasonAnswer = currentQuestion.reasonAnswer!;
    }

    if (currentQuestion.type === 'ORDER') {
      (question as Question).items = currentQuestion.items;
    }

    if (currentQuestion.type === 'FILL') {
      (question as Question).blankAnswers = currentQuestion.blanks;
    }

    currentConcept.questions.push(question);
    questionIndex += 1;
  };

  const finalizeConcept = () => {
    if (currentQuestion) {
      finalizeQuestion();
      currentQuestion = null;
    }
    if (currentConcept) {
      concepts.push(currentConcept);
      currentConcept = null;
      questionIndex = 0;
    }
  };

  while (lineIndex < lines.length) {
    const rawLine = lines[lineIndex];
    const line = rawLine.trim();
    const currentLineNumber = lineIndex + 1;

    if (!line) {
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('##CONCEPT:')) {
      finalizeConcept();
      const title = line.replace('##CONCEPT:', '').trim();
      if (!title) {
        addError('Concept title cannot be empty.', currentLineNumber);
      }
      currentConcept = {
        id: normalizeId(title || `concept-${concepts.length + 1}`),
        title,
        prerequisites: [],
        summary: '',
        questions: [],
      };
      pendingType = null;
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (!currentConcept) {
      addError('Content found before any ##CONCEPT block.', currentLineNumber);
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('##PREREQ:')) {
      const prereq = line.replace('##PREREQ:', '').trim();
      currentConcept.prerequisites = prereq
        ? prereq.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('##SUMMARY:')) {
      currentConcept.summary = line.replace('##SUMMARY:', '').trim();
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('TYPE:') && !currentQuestion) {
      const type = line.replace('TYPE:', '').trim().toUpperCase();
      if (type === 'MCQ' || type === 'TWO_STEP' || type === 'ORDER' || type === 'FILL') {
        pendingType = type;
      } else {
        addError(`Unknown TYPE: ${type}`, currentLineNumber);
      }
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('Q:')) {
      if (currentQuestion) {
        finalizeQuestion();
      }
      currentQuestion = createDraft(currentLineNumber);
      currentQuestion.type = pendingType ?? 'MCQ';
      pendingType = null;
      currentQuestion.prompt = line.replace('Q:', '').trim();
      lineIndex += 1;
      continue;
    }

    if (line === '---') {
      if (currentQuestion) {
        finalizeQuestion();
        currentQuestion = null;
      }
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (!currentQuestion) {
      addError('Question content found before Q: line.', currentLineNumber);
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('TYPE:')) {
      const type = line.replace('TYPE:', '').trim().toUpperCase();
      if (type === 'MCQ' || type === 'TWO_STEP' || type === 'ORDER' || type === 'FILL') {
        currentQuestion.type = type;
      } else {
        addError(`Unknown TYPE: ${type}`, currentLineNumber);
      }
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('ANS:')) {
      currentQuestion.answer = line.replace('ANS:', '').trim();
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('EXPL:')) {
      currentQuestion.explanation = line.replace('EXPL:', '').trim();
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('TAGS:')) {
      const tags = line.replace('TAGS:', '').trim();
      currentQuestion.tags = tags
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('MISCONCEPT:')) {
      currentQuestion.misconception = line.replace('MISCONCEPT:', '').trim();
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('DIFF:')) {
      const diff = Number(line.replace('DIFF:', '').trim());
      currentQuestion.difficulty = Number.isNaN(diff) ? undefined : diff;
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('VAR:')) {
      currentQuestion.variant = line.replace('VAR:', '').trim();
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('REASON:')) {
      currentQuestion.reasonPrompt = line.replace('REASON:', '').trim();
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('REASON_ANS:')) {
      currentQuestion.reasonAnswer = line.replace('REASON_ANS:', '').trim();
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('BLANK:')) {
      const blanks = line.replace('BLANK:', '').trim();
      currentQuestion.blanks = blanks
        ? blanks.split(',').map((blank) => blank.trim()).filter(Boolean)
        : [];
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (line.startsWith('ITEMS:')) {
      itemsMode = true;
      lineIndex += 1;
      continue;
    }

    if (itemsMode && /^[0-9]+[\).]/.test(line)) {
      const itemText = line.replace(/^[0-9]+[\).]\s*/, '').trim();
      currentQuestion.items.push(itemText);
      lineIndex += 1;
      continue;
    }

    if (isOptionLine(line)) {
      currentQuestion.options.push(line.slice(2).trim());
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (isReasonOptionLine(line)) {
      currentQuestion.reasonOptions.push(line.slice(3).trim());
      itemsMode = false;
      lineIndex += 1;
      continue;
    }

    if (itemsMode && !isFieldLine(line)) {
      addError('ITEMS list entry must start with a number (e.g. 1)).', currentLineNumber);
      lineIndex += 1;
      continue;
    }

    addError(`Unrecognized line: ${line}`, currentLineNumber);
    lineIndex += 1;
  }

  finalizeConcept();

  if (!topicTitle || !topicDesc) {
    return { errors };
  }

  return {
    topic: {
      id: normalizeId(topicTitle),
      title: topicTitle,
      description: topicDesc,
      concepts,
    },
    errors,
  };
};
