# Pumpkin

Pumpkin is a recall-first learning system for daily revision. This MVP is a React + TypeScript SPA with a mobile-first UI, localStorage persistence, and plaintext topic content parsing.

## Getting started

```bash
npm install
npm run dev
```

## Content authoring

Content lives in `/content` as plaintext files. Each file follows the Pumpkin format and is loaded as raw text at runtime.

### Format

```text
#TOPIC: Redis
#DESC: In-memory data store used for caching, queues, etc.

##CONCEPT: Single-threaded event loop
##PREREQ: Optional prerequisite concepts, comma-separated
##SUMMARY: Single paragraph concept summary.

Q: Question prompt
A) Option A
B) Option B
C) Option C
D) Option D
ANS: B
EXPL: Explanation shown after answering.
TAGS: comma,separated,tags
MISCONCEPT: Common misconception to address
DIFF: 2
VAR: variant_group_id
---
```

### Question types

- **MCQ** (default): `Q:` + options A-D
- **TWO_STEP**: add `TYPE: TWO_STEP`, `REASON:` plus `REASON_A-D` options, and `ANS: <letter>,<letter>`
- **ORDER**: add `TYPE: ORDER`, then `ITEMS:` and numbered list lines. `ANS` is comma-separated order (e.g. `1,2,3,4`).
- **FILL**: add `TYPE: FILL`, `BLANK:` list, and `ANS` string(s).

### Validation

The parser validates required sections and reports friendly line-numbered errors in the Home screen. Fixing the content file is the fastest way to resolve parser errors.

## Architecture

```
/content        Plaintext topic files
/src/parser     Parsing + validation
/src/scheduler  Review scheduling logic
/src/models     Shared types
/src/components UI components
/src/pages      Route-level screens
/src/store      Local state & persistence
```

## Persistence

User profile, attempts, concept state, and preferences are stored in `localStorage` under a `pumpkin.*` prefix.
