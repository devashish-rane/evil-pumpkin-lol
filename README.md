# Pumpkin MVP

Pumpkin is a recall-first learning system (Anki-like) built as a React SPA. The MVP focuses on daily revision, concept mastery, and a calm, premium UI.

## Setup

```bash
npm install
npm run dev
```

## Editing curriculum content

Plaintext curriculum files live in `/content` and are loaded at runtime. To add a new topic:

1. Create a new file with the suffix `.pumpkin.txt`, for example: `content/redis.pumpkin.txt`.
2. Ensure the file follows the required format below.
3. Refresh the app to see updated topics.

### Plaintext format

```
#TOPIC: Redis
#DESC: In-memory data store used for caching, queues, and real-time workloads.

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
MISCONCEPT: “single-threaded = slow”
DIFF: 2
VAR: single_thread_core
---
```

### Supported question types

- `TYPE: MCQ` (default)
- `TYPE: TWO_STEP`
- `TYPE: ORDER`
- `TYPE: FILL`

#### TWO_STEP format

```
TYPE: TWO_STEP
Q: Redis handles many connections efficiently because it uses:
A) One thread per client
B) I/O multiplexing
C) Kernel bypass
D) Disk batching
ANS: B
REASON: The event loop can watch many sockets without blocking by relying on:
RA) Epoll/kqueue selectors
RB) Forked workers
RC) Global locks
RD) Busy-wait loops
REASON_ANS: RA
EXPL: Multiplexed I/O lets a single thread handle many sockets.
```

#### ORDER format

```
TYPE: ORDER
Q: Order the events when maxmemory is reached and a write occurs.
ITEMS:
1) Write command received
2) Eviction policy evaluated
3) Keys evicted (if policy allows)
4) Write succeeds or errors
ANS: 1,2,3,4
EXPL: Correct causal chain.
```

#### FILL format

```
TYPE: FILL
Q: Redis does not evict keys unless ______ is set.
BLANK: maxmemory
ANS: maxmemory
EXPL: Without maxmemory, eviction policy won’t trigger; writes can fail.
```

### Validation & errors

The parser reports line-numbered validation errors. If you see warnings on the Home page, open the referenced file and fix the reported line.

## Notes

- Content is read-only and stored in `/content`.
- User progress, selected topics, and attempts are persisted in `localStorage`.
- If you clear browser storage, you reset the MVP progress state.
