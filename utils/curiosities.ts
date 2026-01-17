export interface CuriosityFact {
  id: string;
  text: string;
}

export const curiosityFacts: CuriosityFact[] = [
  {
    id: "redis-resp",
    text: "Redis uses the RESP protocol so clients can stream commands efficiently with minimal parsing overhead."
  },
  {
    id: "anki-spacing",
    text: "Spacing effects compound: reviewing just before forgetting is far more durable than binge sessions."
  },
  {
    id: "memory-palace",
    text: "Memory athletes often structure recall as a route through familiar spaces to control attention drift."
  },
  {
    id: "linux-io",
    text: "Most Redis latency spikes are IO or networking pauses, not CPU saturation."
  },
  {
    id: "neural-hazard",
    text: "Learning plateaus are often a sign you need better error diagnostics, not more time on task."
  }
];
