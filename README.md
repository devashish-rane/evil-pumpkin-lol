# Pumpkin

Pumpkin is a recall-first learning system (Anki-like) focused on daily revision. The MVP is a React + TypeScript single-page app with a calm, premium UI and a strict plaintext content format for topics and questions.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Editing plaintext content

All topics live in `/content` as `.pumpkin.txt` files. The app imports these files as raw text and parses them on startup. If the parser finds a formatting issue, it shows a friendly line-numbered error on the Home page.

### Required header

```
#TOPIC: Redis
#DESC: In-memory data store used for caching, queues, etc.
```

### Concepts

```
##CONCEPT: Single-threaded event loop
##PREREQ: (comma-separated concept names or empty)
##SUMMARY: One paragraph summary.
```

### Questions

Each question block starts with `Q:` and ends with a `---` separator. Supported question types:

- `TYPE: MCQ` (default)
- `TYPE: TWO_STEP` (MCQ + REASON)
- `TYPE: ORDER` (ITEMS list + ANS order)
- `TYPE: FILL` (BLANK list + ANS)

Example MCQ:

```
Q: Redis is single-threaded primarily to:
A) Reduce memory usage
B) Avoid locks and context switching
C) Improve disk durability
D) Support sharding automatically
ANS: B
EXPL: Single-threading reduces lock contention and context switches.
TAGS: architecture,performance
MISCONCEPT: single-threaded equals slow
DIFF: 2
VAR: single_thread_core
---
```

Example FILL:

```
TYPE: FILL
Q: Redis does not evict keys unless ______ is set.
BLANK: maxmemory
ANS: maxmemory
EXPL: Without maxmemory, eviction policy won’t trigger.
---
```

## Architecture notes

- `/parser` validates the plaintext format and surfaces line-numbered errors.
- `/scheduler` contains review scheduling and mastery promotion logic.
- `/store` persists user data and learning state in localStorage for the MVP.

## Troubleshooting

- If the app shows a parser error, check `/content` for missing fields or typos.
- To reset local state, clear browser localStorage keys starting with `pumpkin:`.
