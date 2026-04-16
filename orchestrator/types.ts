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
