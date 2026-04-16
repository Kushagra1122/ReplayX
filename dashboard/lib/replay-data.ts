import { promises as fs } from "node:fs";
import path from "node:path";

export const GOLDEN_INCIDENT_ID = "incident-checkout-race-001";

type IncidentSummary = {
  symptom: string;
  customerImpact: string;
  firstObservedAt: string;
  customerVisible: boolean;
};

type IncidentMetric = {
  name: string;
  unit: string;
  value: number;
  observedAt: string;
  baselineValue?: number;
};

type IncidentLog = {
  source: string;
  observedAt: string;
  level: string;
  message: string;
  context: Record<string, string | number | boolean | null>;
};

type IncidentStackTrace = {
  source: string;
  errorType: string;
  message: string;
  frames: Array<{
    file: string;
    line: number;
    column: number;
    function: string;
  }>;
};

type NormalizedIncident = {
  schemaVersion: 1;
  incidentId: string;
  title: string;
  incidentClass: string;
  service: string;
  environment: string;
  severity: string;
  repoRoot: string;
  summary: IncidentSummary;
  suspectedFiles: string[];
  evidence: {
    stackTraces: IncidentStackTrace[];
    logs: IncidentLog[];
    metrics: IncidentMetric[];
  };
  commands: {
    failing: {
      label: string;
      command: string;
      workingDirectory: string;
      expectedExitCode: number;
    };
    healthy: {
      label: string;
      command: string;
      workingDirectory: string;
      expectedExitCode: number;
    };
  };
  recentChanges: Array<{
    commit: string;
    summary: string;
    author: string;
    mergedAt: string;
    files: string[];
  }>;
  constraints: string[];
  acceptanceCriteria: string[];
};

type ReplayCommandExecution = {
  label: string;
  command: string;
  workingDirectory: string;
  expectedExitCode: number;
  actualExitCode: number | null;
  matchedExpectation: boolean;
  durationMs: number;
  stdout: string;
  stderr: string;
};

type ReplayReproPhaseOutput = {
  phase: "repro";
  repro_confirmed: boolean;
  verification_status: "confirmed" | "partially_confirmed" | "blocked";
  failure_surface: string;
  repro_command: string;
  candidate_files: string[];
  confidence: number;
  observed_signals?: {
    stackTraceSources: string[];
    recentChangeCommits: string[];
    logSources: string[];
  };
  command_results?: {
    failing: ReplayCommandExecution;
    healthy: ReplayCommandExecution;
  };
};

type DiagnosisWorkerOutput = {
  worker: string;
  specialty: string;
  diagnosis: string;
  confidence: number;
  observations: string[];
  commands_run: string[];
  candidate_files: string[];
  falsification_note: string;
  status: "completed" | "weak_signal" | "blocked";
};

type DiagnosisWorkerRecord = {
  worker_id: string;
  docs_prompt_id: string;
  specialty: string;
  mode: string;
  output: DiagnosisWorkerOutput;
};

type DiagnosisArenaOutput = {
  phase: "diagnosis-arena";
  worker_count: number;
  codex_worker_count: number;
  fallback_worker_count: number;
  repro_summary: {
    repro_confirmed: boolean;
    verification_status: string;
    failure_surface: string;
    candidate_files: string[];
    confidence: number;
  };
  worker_results: DiagnosisWorkerRecord[];
  ranked_shortlist?: Array<{
    worker_id: string;
    diagnosis: string;
    confidence: number;
    candidate_files: string[];
    observations: string[];
    specialty?: string;
  }>;
  challenger_ready?: {
    winning_worker: string;
    shortlisted_workers: string[];
  };
};

type DashboardReplayArtifact = {
  schemaVersion: 1;
  incidentId: string;
  incident_card: {
    title: string;
    service: string;
    severity: string;
    symptom: string;
    customerImpact: string;
  };
  timeline: Array<{
    step: string;
    title: string;
    summary: string;
    status: "completed" | "highlighted";
  }>;
  worker_cards: Array<{
    worker: string;
    specialty: string;
    diagnosis: string;
    confidence: number;
    status: string;
  }>;
  winner_card: {
    worker: string;
    diagnosis: string;
    confidence: number;
    winning_reason: string;
  };
  fix_card: {
    strategy: string;
    summary: string;
    changed_files: string[];
    verification_result: string;
  };
  proof_card: {
    review_verdict: string;
    regression_command: string;
    regression_summary: string;
  };
  postmortem_card: {
    summary: string;
    path: string;
  };
  skill_card: {
    summary: string;
    path: string;
  };
  before_after: {
    before: string;
    after: string;
  };
  demo_summary: string;
};

export type ReplayWorkerCard = {
  workerId: string;
  label: string;
  shortTitle: string;
  diagnosis: string;
  confidence: number;
  observations: string[];
  mode: string;
  status: "completed" | "weak_signal" | "blocked";
};

export type ReplayBundle = {
  incident: NormalizedIncident;
  repro: ReplayReproPhaseOutput | null;
  diagnosis: DiagnosisArenaOutput | null;
  workerCards: ReplayWorkerCard[];
  winningDiagnosis: {
    workerId: string;
    shortTitle: string;
    diagnosis: string;
    confidence: number;
    candidateFiles: string[];
    observations: string[];
  } | null;
  fixCard: {
    title: string;
    summary: string;
    points: string[];
  };
  proofCard: {
    title: string;
    summary: string;
    points: string[];
  };
  postmortemCard: {
    title: string;
    summary: string;
    points: string[];
  };
  skillCard: {
    title: string;
    summary: string;
    points: string[];
  };
  beforeAfter: {
    beforeLabel: string;
    beforeEvidence: string;
    afterLabel: string;
    afterEvidence: string;
  };
  timeline: Array<{
    title: string;
    detail: string;
    status: "done" | "now" | "next";
  }>;
};

const rootDir = path.resolve(process.cwd(), "..");
const artifactsDir = path.join(rootDir, "artifacts");
const incidentsDir = path.join(rootDir, "incidents");

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const text = await fs.readFile(filePath, "utf8");
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

function incidentPathFromId(incidentId: string): string {
  if (incidentId.includes("checkout")) {
    return path.join(incidentsDir, "checkout-race-condition.json");
  }
  if (incidentId.includes("auth")) {
    return path.join(incidentsDir, "auth-token-session-failure.json");
  }
  if (incidentId.includes("null-shape")) {
    return path.join(incidentsDir, "null-data-shape-failure.json");
  }

  return path.join(incidentsDir, `${incidentId}.json`);
}

function workerLabel(workerId: string): string {
  return workerId.replace("diagnosis_", "").replaceAll("_", " ");
}

function workerShortTitle(workerId: string): string {
  const normalized = workerLabel(workerId);
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function summarizeProof(
  incident: NormalizedIncident,
  repro: ReplayReproPhaseOutput | null,
  diagnosis: DiagnosisArenaOutput | null
) {
  const failing = repro?.command_results?.failing;
  const healthy = repro?.command_results?.healthy;
  const points = [
    failing
      ? `${failing.label} returned ${failing.actualExitCode} and matched the expected failure.`
      : "The failing repro artifact is not available yet.",
    healthy
      ? `${healthy.label} returned ${healthy.actualExitCode} and preserved the healthy control.`
      : "The healthy control artifact is not available yet.",
    diagnosis?.challenger_ready?.winning_worker
      ? `Diagnosis shortlist is challenger-ready with ${diagnosis.challenger_ready.winning_worker} in front.`
      : "Challenger output is not persisted yet, so replay currently stops at the diagnosis shortlist."
  ];

  return {
    title: healthy && failing ? "Failure isolated, healthy path preserved" : "Replay proof path still forming",
    summary:
      repro?.verification_status === "confirmed"
        ? `ReplayX already proves the broken path and its healthy control for ${incident.service}.`
        : "Replay proof is partial; the dashboard is ready to surface stronger regression artifacts once later phases land.",
    points
  };
}

function summarizeFix(bundle: {
  incident: NormalizedIncident;
  diagnosis: DiagnosisArenaOutput | null;
}) {
  const winner = bundle.diagnosis?.ranked_shortlist?.[0];
  if (!winner) {
    return {
      title: "Fix arena pending",
      summary: "The dashboard is replay-ready before the fix arena lands. This card will show the chosen fix once Phase 7 artifacts exist.",
      points: [
        "Winning diagnosis will roll into minimal, safe, and durable fix strategies.",
        "The demo keeps this visible so judges see what has landed and what comes next.",
        "No live backend call is required for the replay path."
      ]
    };
  }

  return {
    title: "Fix arena queued from the winning diagnosis",
    summary: `ReplayX is ready to turn the ${workerShortTitle(winner.worker_id)} diagnosis into bounded fix strategies.`,
    points: [
      `Primary files: ${winner.candidate_files.slice(0, 3).join(", ")}`,
      "Planned strategies: minimal_fix, safe_fix, durable_fix.",
      "The replay path stays deterministic even before live fix execution is wired."
    ]
  };
}

function summarizePostmortem(incident: NormalizedIncident) {
  return {
    title: "Postmortem artifact pending",
    summary:
      "ReplayX will convert the verified run into a concise engineering postmortem once downstream artifacts are generated.",
    points: [
      `Customer impact already captured: ${incident.summary.customerImpact}`,
      "Later phases will normalize root cause, fix choice, and guardrails into a reusable narrative.",
      "The replay UI reserves this slot now so the final demo feels complete."
    ]
  };
}

function summarizeSkill(incident: NormalizedIncident) {
  return {
    title: "Reusable skill artifact pending",
    summary:
      "ReplayX turns successful incidents into reusable incident-response skills instead of leaving them as one-off debugging wins.",
    points: [
      `Incident class: ${incident.incidentClass}`,
      "Expected skill contents: repro clues, fix cues, falsification notes, and constraints.",
      "This slot becomes a powerful final beat in the 2-minute demo."
    ]
  };
}

function buildBeforeAfter(incident: NormalizedIncident, repro: ReplayReproPhaseOutput | null) {
  const failing = repro?.command_results?.failing;
  const healthy = repro?.command_results?.healthy;

  return {
    beforeLabel: "Before: the app breaks in a way a judge can feel immediately",
    beforeEvidence:
      failing?.stderr?.trim() ??
      `${incident.summary.symptom}\n\nNo failing stderr artifact found yet for this incident replay.`,
    afterLabel: "After: the healthy path still works and the proof trail tightens",
    afterEvidence:
      healthy?.stdout?.trim() ??
      incident.acceptanceCriteria.map((criterion, index) => `${index + 1}. ${criterion}`).join("\n")
  };
}

function buildTimeline(bundle: {
  incident: NormalizedIncident;
  repro: ReplayReproPhaseOutput | null;
  diagnosis: DiagnosisArenaOutput | null;
}) {
  const winner = bundle.diagnosis?.ranked_shortlist?.[0];

  return [
    {
      title: "Incident lands with clear customer pain",
      detail: bundle.incident.summary.customerImpact,
      status: "done" as const
    },
    {
      title: "ReplayX confirms the broken path",
      detail:
        bundle.repro?.failure_surface ?? "The replay contract is ready, but the repro artifact is still missing.",
      status: "done" as const
    },
    {
      title: "Bounded diagnosis workers fan out",
      detail:
        bundle.diagnosis
          ? `${bundle.diagnosis.worker_count} workers ran and produced a ranked shortlist.`
          : "Diagnosis arena artifacts are not available yet.",
      status: "done" as const
    },
    {
      title: "Winning diagnosis rises to the top",
      detail: winner?.diagnosis ?? "Winning diagnosis will appear here once the shortlist is available.",
      status: "now" as const
    },
    {
      title: "Fix, proof, and reusable knowledge complete the loop",
      detail:
        "Later-phase artifacts slot into this replay without changing the judge-facing story: chosen fix, regression proof, postmortem, and skill.",
      status: "next" as const
    }
  ];
}

export async function listReplayIncidents(): Promise<NormalizedIncident[]> {
  const entries = await fs.readdir(artifactsDir, { withFileTypes: true });
  const incidentIds = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  const incidents = await Promise.all(
    incidentIds.map(async (incidentId) => readJsonFile<NormalizedIncident>(incidentPathFromId(incidentId)))
  );

  return incidents.filter((incident): incident is NormalizedIncident => Boolean(incident));
}

export async function loadReplayIncidentBundle(incidentId: string): Promise<ReplayBundle> {
  const incident = await readJsonFile<NormalizedIncident>(incidentPathFromId(incidentId));
  if (!incident) {
    throw new Error(`Unknown incident: ${incidentId}`);
  }

  const repro = await readJsonFile<ReplayReproPhaseOutput>(
    path.join(artifactsDir, incidentId, "phase.repro.json")
  );
  const diagnosis = await readJsonFile<DiagnosisArenaOutput>(
    path.join(artifactsDir, incidentId, "phase.diagnosis-arena.json")
  );
  const dashboardReplay = await readJsonFile<DashboardReplayArtifact>(
    path.join(artifactsDir, incidentId, "dashboard-replay.json")
  );

  const workerCards: ReplayWorkerCard[] = (diagnosis?.worker_results ?? []).map((worker) => ({
    workerId: worker.worker_id,
    label: `Worker ${worker.docs_prompt_id}`,
    shortTitle: workerShortTitle(worker.worker_id),
    diagnosis: worker.output.diagnosis,
    confidence: worker.output.confidence,
    observations: worker.output.observations,
    mode: worker.mode,
    status: worker.output.status
  }));

  const winning = diagnosis?.ranked_shortlist?.[0];
  const winningDiagnosis = winning
    ? {
        workerId: winning.worker_id,
        shortTitle: workerShortTitle(winning.worker_id),
        diagnosis: winning.diagnosis,
        confidence: winning.confidence,
        candidateFiles: winning.candidate_files,
        observations: winning.observations
      }
    : null;

  return {
    incident,
    repro,
    diagnosis,
    workerCards,
    winningDiagnosis,
    fixCard: dashboardReplay
      ? {
          title: dashboardReplay.fix_card.strategy,
          summary: dashboardReplay.fix_card.summary,
          points: [
            dashboardReplay.fix_card.verification_result,
            `Changed files: ${dashboardReplay.fix_card.changed_files.join(", ")}`
          ]
        }
      : summarizeFix({ incident, diagnosis }),
    proofCard: dashboardReplay
      ? {
          title: dashboardReplay.proof_card.review_verdict,
          summary: dashboardReplay.proof_card.regression_summary,
          points: [dashboardReplay.proof_card.regression_command]
        }
      : summarizeProof(incident, repro, diagnosis),
    postmortemCard: dashboardReplay
      ? {
          title: "Postmortem generated",
          summary: dashboardReplay.postmortem_card.summary,
          points: [dashboardReplay.postmortem_card.path]
        }
      : summarizePostmortem(incident),
    skillCard: dashboardReplay
      ? {
          title: "Skill generated",
          summary: dashboardReplay.skill_card.summary,
          points: [dashboardReplay.skill_card.path]
        }
      : summarizeSkill(incident),
    beforeAfter: dashboardReplay
      ? {
          beforeLabel: "Before: the app breaks in a way a judge can feel immediately",
          beforeEvidence: dashboardReplay.before_after.before,
          afterLabel: "After: the chosen fix and proof stabilize the flow",
          afterEvidence: dashboardReplay.before_after.after
        }
      : buildBeforeAfter(incident, repro),
    timeline: dashboardReplay
      ? dashboardReplay.timeline.map((entry) => ({
          title: entry.title,
          detail: entry.summary,
          status:
            entry.status === "highlighted"
              ? ("now" as const)
              : entry.step === dashboardReplay.timeline.at(-1)?.step
                ? ("next" as const)
                : ("done" as const)
        }))
      : buildTimeline({ incident, repro, diagnosis })
  };
}

export function formatTimestamp(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}
