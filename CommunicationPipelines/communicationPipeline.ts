export interface communicationPipeline {
  // Pipelines are responsible that broken connections get reestablished automatically

  // SHOULD be called once and allows the pipeline to get everything ready. MUST be idempotent!
  initialize(): void;
  // SHOULD be called once and will start traffic through pipeline. MUST be idempotent! Return non-zero if unsuccessful
  start(): number;

  tearDown(): number;
}
