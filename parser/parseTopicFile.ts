import { Concept, Question, QuestionOption, QuestionType, Topic } from "../models/types";

interface ParseError extends Error {
  line: number;
}

const createParseError = (message: string, line: number): ParseError => {
  const error = new Error(`Line ${line}: ${message}`) as ParseError;
  error.line = line;
  return error;
};

const normalizeId = (input: string) =>
  input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const splitList = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseOptions = (lines: string[], startLine: number): QuestionOption[] => {
  const options: QuestionOption[] = [];
  const optionLabels: Array<QuestionOption["label"]> = ["A", "B", "C", "D"];

  optionLabels.forEach((label, index) => {
    const line = lines[index];
    if (!line?.startsWith(`${label})`)) {
      throw createParseError(
        `Expected option ${label}) but got "${line ?? "(empty)"}"`,
        startLine + index
      );
    }
    options.push({ label, text: line.slice(2).trim() });
  });

  return options;
};

const parseQuestionBlock = (
  blockLines: string[],
  conceptId: string,
  startLine: number
): Question => {
  const fields: Record<string, string[]> = {};
  const optionLines: string[] = [];
  let currentKey = "";

  blockLines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    const optionMatch = trimmed.match(/^[A-D]\)/);
    if (optionMatch) {
      optionLines.push(trimmed);
      return;
    }

    const keyMatch = trimmed.match(/^([A-Z_]+):\s?(.*)$/);
    if (keyMatch) {
      const [, key, rest] = keyMatch;
      currentKey = key;
      if (!fields[key]) {
        fields[key] = [];
      }
      if (rest) {
        fields[key].push(rest);
      }
    } else if (currentKey) {
      fields[currentKey].push(trimmed);
    } else {
      throw createParseError(
        `Unexpected line without a field: "${trimmed}"`,
        startLine + index
      );
    }
  });

  const prompt = fields.Q?.join(" ").trim();
  if (!prompt) {
    throw createParseError("Question prompt (Q:) is required.", startLine);
  }

  const type = (fields.TYPE?.[0]?.trim().toUpperCase() ?? "MCQ") as QuestionType;
  const answer = fields.ANS?.[0]?.trim();
  const explanation = fields.EXPL?.join(" ").trim();

  if (!answer) {
    throw createParseError("ANS field is required.", startLine);
  }
  if (!explanation) {
    throw createParseError("EXPL field is required.", startLine);
  }

  const base = {
    id: `${conceptId}-${normalizeId(prompt).slice(0, 48)}`,
    conceptId,
    prompt,
    type,
    answer,
    explanation,
    tags: splitList(fields.TAGS?.join(" ") ?? ""),
    misconceptions: splitList(fields.MISCONCEPT?.join(" ") ?? ""),
    difficulty: Number(fields.DIFF?.[0] ?? 2),
    variantGroup: fields.VAR?.[0]?.trim()
  };

  if (type === "ORDER") {
    const items = fields.ITEMS?.map((item) => item.replace(/^\d+\)\s?/, "").trim());
    if (!items || items.length < 2) {
      throw createParseError("ORDER questions require ITEMS with at least 2 entries.", startLine);
    }
    return { ...base, type, items };
  }

  if (type === "FILL") {
    const blanks = fields.BLANK?.map((entry) => entry.trim());
    if (!blanks || blanks.length === 0) {
      throw createParseError("FILL questions require BLANK entries.", startLine);
    }
    return { ...base, type, blanks };
  }

  const options = parseOptions(optionLines, startLine + (fields.Q?.length ?? 0) + 1);
  if (type === "TWO_STEP") {
    const reason = fields.REASON?.join(" ").trim();
    if (!reason) {
      throw createParseError("TWO_STEP questions require REASON.", startLine);
    }
    return { ...base, type, options, reason };
  }

  return { ...base, type: "MCQ", options };
};

export const parseTopicFile = (raw: string): Topic => {
  const lines = raw.split(/\r?\n/);
  const headerTopic = lines.findIndex((line) => line.startsWith("#TOPIC:"));
  const headerDesc = lines.findIndex((line) => line.startsWith("#DESC:"));

  if (headerTopic !== 0) {
    throw createParseError("#TOPIC must be the first line.", 1);
  }
  if (headerDesc !== 1) {
    throw createParseError("#DESC must be the second line.", 2);
  }

  const name = lines[0].replace("#TOPIC:", "").trim();
  const description = lines[1].replace("#DESC:", "").trim();

  if (!name || !description) {
    throw createParseError("#TOPIC and #DESC values cannot be empty.", 1);
  }

  const concepts: Concept[] = [];
  let index = 2;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line) {
      index += 1;
      continue;
    }

    if (!line.startsWith("##CONCEPT:")) {
      throw createParseError("Concept must start with ##CONCEPT.", index + 1);
    }

    const conceptName = line.replace("##CONCEPT:", "").trim();
    if (!conceptName) {
      throw createParseError("Concept name cannot be empty.", index + 1);
    }

    const conceptId = normalizeId(conceptName);
    index += 1;

    const prereqLine = lines[index]?.trim();
    if (!prereqLine?.startsWith("##PREREQ:")) {
      throw createParseError("Concept requires ##PREREQ line.", index + 1);
    }
    const prerequisites = splitList(prereqLine.replace("##PREREQ:", "").trim());
    index += 1;

    const summaryLine = lines[index]?.trim();
    if (!summaryLine?.startsWith("##SUMMARY:")) {
      throw createParseError("Concept requires ##SUMMARY line.", index + 1);
    }
    const summary = summaryLine.replace("##SUMMARY:", "").trim();
    if (!summary) {
      throw createParseError("Concept summary cannot be empty.", index + 1);
    }
    index += 1;

    const questionBlocks: Array<{ lines: string[]; startLine: number }> = [];
    let currentBlock: string[] = [];
    let blockStartLine = index + 1;

    while (index < lines.length && !lines[index].trim().startsWith("##CONCEPT:")) {
      const currentLine = lines[index];
      if (currentLine.trim() === "---") {
        if (currentBlock.length > 0) {
          questionBlocks.push({ lines: currentBlock, startLine: blockStartLine });
          currentBlock = [];
        }
        blockStartLine = index + 2;
      } else {
        currentBlock.push(currentLine);
      }
      index += 1;
    }

    if (currentBlock.length > 0) {
      questionBlocks.push({ lines: currentBlock, startLine: blockStartLine });
    }

    if (questionBlocks.length === 0) {
      throw createParseError("Each concept must include at least one question.", blockStartLine);
    }

    const questions = questionBlocks.map((block) =>
      parseQuestionBlock(block.lines, conceptId, block.startLine)
    );

    concepts.push({
      id: conceptId,
      name: conceptName,
      summary,
      prerequisites,
      questions
    });
  }

  return {
    id: normalizeId(name),
    name,
    description,
    concepts
  };
};
