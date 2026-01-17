import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../store/DataContext';
import { writeJSON } from '../utils/storage';

const NOTES_PREFIX = 'pumpkin.notes';

function loadNotes(key: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as string;
  } catch (error) {
    console.warn(`Failed to read ${key} from storage`, error);
    return null;
  }
}

function renderInline(text: string): React.ReactNode[] {
  const tokens = text
    .split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g)
    .filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={`code-${index}`}
          className="rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-xs text-ink-800"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={`strong-${index}`} className="font-semibold text-ink-900">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('*') && token.endsWith('*')) {
      return (
        <em key={`em-${index}`} className="italic text-ink-800">
          {token.slice(1, -1)}
        </em>
      );
    }
    if (token.startsWith('[')) {
      const match = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        return (
          <a
            key={`link-${index}`}
            href={match[2]}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-ink-900 underline decoration-ink-300 underline-offset-2"
          >
            {match[1]}
          </a>
        );
      }
    }
    return (
      <span key={`text-${index}`} className="text-ink-700">
        {token}
      </span>
    );
  });
}

function renderMarkdown(content: string): React.ReactNode[] {
  const lines = content.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const pushParagraph = (text: string) => {
    blocks.push(
      <p key={`p-${blocks.length}`} className="text-sm leading-relaxed text-ink-700">
        {renderInline(text)}
      </p>
    );
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push(
          <pre
            key={`code-${blocks.length}`}
            className="overflow-x-auto rounded-2xl bg-ink-900 p-4 text-xs text-ink-50"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        inCodeBlock = false;
        codeLines = [];
      } else {
        inCodeBlock = true;
        codeLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      continue;
    }

    if (trimmed === '---') {
      blocks.push(<hr key={`hr-${blocks.length}`} className="border-ink-200" />);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const headingClass =
        level === 1
          ? 'text-lg font-semibold text-ink-900'
          : level === 2
          ? 'text-base font-semibold text-ink-900'
          : 'text-sm font-semibold text-ink-800';
      blocks.push(
        <div key={`h-${blocks.length}`} className={headingClass}>
          {headingText}
        </div>
      );
      continue;
    }

    if (trimmed.startsWith('>')) {
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="border-l-2 border-ink-300 pl-3 text-sm italic text-ink-700"
        >
          {renderInline(trimmed.replace(/^>\s?/, ''))}
        </blockquote>
      );
      continue;
    }

    const isUnordered = /^(\-|\*)\s+/.test(trimmed);
    const isOrdered = /^\d+\.\s+/.test(trimmed);
    if (isUnordered || isOrdered) {
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index].trim();
        if (!current) {
          index += 1;
          break;
        }
        if (isOrdered && /^\d+\.\s+/.test(current)) {
          items.push(current.replace(/^\d+\.\s+/, ''));
          index += 1;
          continue;
        }
        if (isUnordered && /^(\-|\*)\s+/.test(current)) {
          items.push(current.replace(/^(\-|\*)\s+/, ''));
          index += 1;
          continue;
        }
        break;
      }
      index -= 1;
      const ListTag = isOrdered ? 'ol' : 'ul';
      const listClass = isOrdered
        ? 'list-decimal space-y-1 pl-5 text-sm text-ink-700'
        : 'list-disc space-y-1 pl-5 text-sm text-ink-700';
      blocks.push(
        <ListTag key={`list-${blocks.length}`} className={listClass}>
          {items.map((item, itemIndex) => (
            <li key={`li-${blocks.length}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ListTag>
      );
      continue;
    }

    pushParagraph(line);
  }

  if (inCodeBlock) {
    blocks.push(
      <pre
        key={`code-${blocks.length}`}
        className="overflow-x-auto rounded-2xl bg-ink-900 p-4 text-xs text-ink-50"
      >
        <code>{codeLines.join('\n')}</code>
      </pre>
    );
  }

  return blocks;
}

export default function Notes() {
  const { topicId } = useParams();
  const { topics } = useData();
  const navigate = useNavigate();
  const topic = topics.find((item) => item.id === topicId);
  const storageKey = useMemo(
    () => `${NOTES_PREFIX}.${topicId ?? 'unknown'}`,
    [topicId]
  );
  const lastKeyRef = useRef<string | null>(null);
  const [notes, setNotes] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const previewBlocks = useMemo(() => renderMarkdown(notes), [notes]);

  const defaultNotes = useMemo(() => {
    if (!topic) return '';
    const conceptLines = topic.concepts.map((concept) => `- ${concept.title}`).join('\n');
    return `# ${topic.title} interview notes\n\n## What interviewers expect\n- Key decisions and tradeoffs\n- Real failure modes and how to debug them\n- Why you would choose this over alternatives\n\n## Concepts\n${conceptLines}\n\n## Question takeaways\n- \n\n## Gaps to close\n- \n\n## Links\n- `; 
  }, [topic]);

  useEffect(() => {
    if (!topicId || !topic) return;
    const stored = loadNotes(storageKey);
    if (stored !== null) {
      setNotes(stored);
      setLastSavedAt(Date.now());
    } else {
      setNotes(defaultNotes);
    }
  }, [defaultNotes, storageKey, topic, topicId]);

  const persistNotes = useCallback(
    (value: string) => {
      if (!topicId) return;
      writeJSON(storageKey, value);
      setLastSavedAt(Date.now());
    },
    [storageKey, topicId]
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    lastKeyRef.current = event.key;
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value;
    setNotes(nextValue);
    if (lastKeyRef.current === ' ' || lastKeyRef.current === '.') {
      persistNotes(nextValue);
    }
  };

  if (!topic && topics.length === 0) {
    return <div className="text-sm text-ink-600">Loading notes...</div>;
  }

  if (!topic) {
    return (
      <div className="text-sm text-ink-600">
        Topic not found.{' '}
        <button
          type="button"
          onClick={() => navigate('/topics')}
          className="font-semibold text-ink-900 underline underline-offset-2"
        >
          Back to topics
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="rounded-3xl border border-ink-200 bg-white/90 p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Notes for {topic.title}
            </div>
            <h1 className="text-2xl font-semibold text-ink-900">Interview notes</h1>
            <p className="mt-2 text-sm text-ink-600">
              Self-assess each concept and refine your explanations as you go.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500">
            <span className="rounded-full border border-ink-200 bg-white px-3 py-1 font-semibold text-ink-700">
              {topic.id}.md
            </span>
            <span className="rounded-full border border-ink-200 bg-ink-100 px-3 py-1 font-semibold text-ink-600">
              Autosave on space or .
            </span>
            <Link
              to={`/topic/${topic.id}`}
              className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              Back to topic
            </Link>
          </div>
        </div>
      </div>

      <div className={`grid gap-6 ${isPreviewExpanded ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
        {!isPreviewExpanded && (
          <section className="rounded-3xl border border-ink-200 bg-white/95 p-5 shadow-soft">
            <div className="flex items-center justify-between border-b border-ink-200 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-200" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-200" />
                Markdown editor
              </div>
              {lastSavedAt && (
                <div className="text-xs text-ink-500">Auto-saved</div>
              )}
            </div>
            <textarea
              value={notes}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={() => persistNotes(notes)}
              rows={20}
              wrap="soft"
              spellCheck={false}
              className="mt-4 h-[520px] w-full resize-none rounded-2xl border border-ink-200 bg-ink-50 p-4 font-mono text-sm leading-6 text-ink-900 outline-none transition focus:border-ink-400 whitespace-pre-wrap break-words overflow-y-auto overflow-x-hidden"
            />
          </section>
        )}

        <section className="rounded-3xl border border-ink-200 bg-white/95 p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Preview
            </div>
            <button
              type="button"
              onClick={() => setIsPreviewExpanded((prev) => !prev)}
              className="rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              {isPreviewExpanded ? 'Collapse preview' : 'Expand preview'}
            </button>
          </div>
          <div className="mt-4 h-[520px] space-y-3 overflow-y-auto pr-2 break-words">
            {previewBlocks}
          </div>
        </section>
      </div>
    </div>
  );
}
