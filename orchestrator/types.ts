export const replayXPhaseIds = [
  "incident-intake",
  "skill-match",
  "repro",
  "diagnosis-arena",
  "challenger-validation",
  "fix-arena",
  "review-and-regression",
  "postmortem-and-skill"
] as const;

export type ReplayXPhaseId = (typeof replayXPhaseIds)[number];

export type ReplayXPhaseStatus = "pending" | "blocked" | "ready";

export const replayXIncidentClasses = [
  "checkout-race-condition",
  "auth-token-session-failure",
  "null-data-shape-failure"
] as const;

export type ReplayXIncidentClass = (typeof replayXIncidentClasses)[number];

export const replayXIncidentEnvironments = ["development", "staging", "production"] as const;

export type ReplayXIncidentEnvironment = (typeof replayXIncidentEnvironments)[number];

export const replayXIncidentSeverities = ["sev-1", "sev-2", "sev-3", "sev-4"] as const;

export type ReplayXIncidentSeverity = (typeof replayXIncidentSeverities)[number];

export const replayXLogLevels = ["info", "warn", "error"] as const;

export type ReplayXLogLevel = (typeof replayXLogLevels)[number];

export interface ReplayXIncidentSummary {
  symptom: string;
  customerImpact: string;
  firstObservedAt: string;
  customerVisible: boolean;
}

export interface ReplayXMetricSnapshot {
  name: string;
  unit: string;
  value: number;
  observedAt: string;
  baselineValue?: number;
}

export interface ReplayXLogExcerpt {
  source: string;
  observedAt: string;
  level: ReplayXLogLevel;
  message: string;
  context: Record<string, boolean | number | string | null>;
}

export interface ReplayXStackFrame {
  file: string;
  line: number;
  column: number;
  function: string;
}

export interface ReplayXStackTrace {
  source: string;
  errorType: string;
  message: string;
  frames: ReplayXStackFrame[];
}

export interface ReplayXCommandSpec {
  label: string;
  command: string;
  workingDirectory: string;
  expectedExitCode: number;
}

export interface ReplayXRecentChange {
  commit: string;
  summary: string;
  author: string;
  mergedAt: string;
  files: string[];
}

export interface NormalizedIncident {
  schemaVersion: 1;
  incidentId: string;
  title: string;
  incidentClass: ReplayXIncidentClass;
  service: string;
  environment: ReplayXIncidentEnvironment;
  severity: ReplayXIncidentSeverity;
  repoRoot: string;
  summary: ReplayXIncidentSummary;
  suspectedFiles: string[];
  evidence: {
    stackTraces: ReplayXStackTrace[];
    logs: ReplayXLogExcerpt[];
    metrics: ReplayXMetricSnapshot[];
  };
  commands: {
    failing: ReplayXCommandSpec;
    healthy: ReplayXCommandSpec;
  };
  recentChanges: ReplayXRecentChange[];
  constraints: string[];
  acceptanceCriteria: string[];
}

export interface ReplayXIncidentPointer {
  incidentId: string;
  inputPath: string;
  normalizedPath: string;
}

export interface ReplayXRuntimeConfig {
  repoRoot: string;
  artifactsRoot: string;
  defaultModel: string;
  maxParallelWorkers: number;
}

export interface ReplayXPhaseDefinition {
  id: ReplayXPhaseId;
  label: string;
  goal: string;
  requiredVerificationCommand: string;
  requiredOutputSchema: string;
  artifactOutputs: string[];
  dependsOn: ReplayXPhaseId[];
  status: ReplayXPhaseStatus;
  implementationNotes?: string;
}

export interface ReplayXRunPlan {
  incident: ReplayXIncidentPointer;
  runtime: ReplayXRuntimeConfig;
  phases: ReplayXPhaseDefinition[];
}
