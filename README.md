# Pumpkin — Recall-first learning MVP

Pumpkin is a mobile-first, recall-first learning system inspired by spaced repetition. The MVP uses a React + TypeScript SPA with a light saffron theme and offline-friendly localStorage persistence.

## Quick start

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
npm run preview
```

## Content editing (plaintext)

Pumpkin reads content from `/content/*.pumpkin.txt` files. You can add new topics or update questions by editing plaintext files only.

### File format

```text
#TOPIC: Redis
#DESC: In-memory data store used for caching, queues, etc.

##CONCEPT: Single-threaded event loop
##PREREQ:
##SUMMARY: Redis processes commands largely in a single thread to avoid lock contention.

Q: Redis is single-threaded primarily to:
A) Reduce memory usage
B) Avoid locks and context switching
C) Improve disk durability
D) Support sharding automatically
ANS: B
EXPL: Single-threading reduces lock contention and context switches.
TAGS: architecture,performance
MISCONCEPT: people think “single-threaded = slow”
DIFF: 2
VAR: single_thread_core
---
```

### Supported question types

- `TYPE: MCQ` (default)
- `TYPE: TWO_STEP` (MCQ + reasoning options)
- `TYPE: ORDER` (ordered list)
- `TYPE: FILL` (fill in the blank)

Example additions:

```text
Q: Redis does not evict keys unless ______ is set.
TYPE: FILL
BLANK: maxmemory
ANS: maxmemory
EXPL: Without maxmemory, eviction policy won’t trigger; writes can fail.
---

Q: Order the events when maxmemory is reached and a write occurs.
TYPE: ORDER
ITEMS:
1) Write command received
2) Eviction policy evaluated
3) Keys evicted (if policy allows)
4) Write succeeds or errors
ANS: 1,2,3,4
EXPL: Correct causal chain.
---
```

### Validation

The parser validates required fields and reports line-specific errors so issues are easy to debug. Parse errors appear on the Home page under “Content parsing warnings”.

## Project structure

```
content/            Plaintext topic files
src/components/     UI components
src/models/         Types and domain models
src/pages/          Route pages
src/parser/         Plaintext parsing and validation
src/scheduler/      Review scheduling logic
src/store/          Local state and persistence
src/utils/          Helpers and seed data
```

## Notes

- Authentication is client-side only for MVP. The user object is stored in localStorage.
- User data (attempts, concept states, preferences) is persisted locally.
- The UI is designed to be calm, serious, and premium with a light saffron accent.
