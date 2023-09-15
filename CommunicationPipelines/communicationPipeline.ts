export interface communicationPipeline {
  // Communication Pipelines abstract different communication flows e.g. websocket and bluetooth and
  // provide tools for other components to interact with these services
  // Pipelines are responsible that broken connections get reestablished automatically

  // SHOULD be called once and allows the pipeline to get everything ready. MUST be idempotent!
  initialize(): void;
  // SHOULD be called once and will start traffic through pipeline. MUST be idempotent! Return non-zero if unsuccessful
  // Pipelines must be ready to get started as soon as the authentication step is done
  start(): number;

  // authenticate, needs to be called *after* initialize and *before* start
  authenticate(authToken: string): void;

  tearDown(): number;

  isCurrentlyHealthy(): boolean;

  ingest(msg: string);
}
