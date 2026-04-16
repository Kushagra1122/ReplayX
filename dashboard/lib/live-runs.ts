import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type {
  ReplayXDashboardReplayArtifact,
  NormalizedIncident,
  ReplayXPhaseId,
  ReplayXRuntimeConfig
} from "../../orchestrator/types.js";

export type LiveRunStatus = "queued" | "running" | "completed" | "failed";
export type LivePhaseStatus = "queued" | "running" | "completed" | "failed";

export type LiveRunPhase = {
  id: ReplayXPhaseId;
  label: string;
  status: LivePhaseStatus;
  startedAt: string | null;
  completedAt: string | null;
  summary: string;
};

export type CreateReplayXRunInput = {
  source: "slack" | "manual";
  text: string;
  channel?: string | null;
  threadTs?: string | null;
  user?: string | null;
};

export type LiveRunCards = {
  workerCards: ReplayXDashboardReplayArtifact["worker_cards"];
  winningDiagnosis: ReplayXDashboardReplayArtifact["winner_card"];
  fix: ReplayXDashboardReplayArtifact["fix_card"];
  proof: ReplayXDashboardReplayArtifact["proof_card"];
  postmortem: ReplayXDashboardReplayArtifact["postmortem_card"];
  skill: ReplayXDashboardReplayArtifact["skill_card"];
  beforeAfter: ReplayXDashboardReplayArtifact["before_after"];
  demoSummary: string;
};

export type ReplayXLiveRun = {
  schemaVersion: 1;
  runId: string;
  source: "slack" | "manual";
  status: LiveRunStatus;
  incidentId: string;
  incidentPath: string;
  currentPhaseId: ReplayXPhaseId | null;
  issue: {
    text: string;
    channel: string | null;
    threadTs: string | null;
    user: string | null;
  };
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  error: string | null;
  phases: LiveRunPhase[];
  cards: LiveRunCards;
};

export type LiveRunOptions = {
  repoRoot?: string;
  runStoreRoot?: string;
  artifactsRoot?: string;
  phaseDelayMs?: number;
};

const defaultRepoRoot = process.cwd();

const livePhaseDefinitions: Array<{ id: ReplayXPhaseId; label: string }> = [
  { id: "incident-intake", label: "Incident intake" },
  { id: "skill-match", label: "Fast-path skill match" },
  { id: "repro", label: "Repro and environment verification" },
  { id: "diagnosis-arena", label: "Diagnosis arena" },
  { id: "challenger-validation", label: "Challenger validation" },
  { id: "fix-arena", label: "Fix arena" },
  { id: "review-and-regression", label: "Review and regression proof" },
  { id: "postmortem-and-skill", label: "Postmortem and reusable skill" }
];

const pendingCards = (issueText: string): LiveRunCards => ({
  workerCards: [],
  winningDiagnosis: {
    worker: "pending",
    diagnosis: "ReplayX is preparing the worker arena.",
    confidence: 0,
    winning_reason: "Waiting for diagnosis workers to produce evidence."
  },
  fix: {
    strategy: "pending",
    summary: "Fix arena has not started yet.",
    changed_files: [],
    verification_result: "Verification plan will appear after review."
  },
  proof: {
    review_verdict: "pending",
    regression_command: "pending",
    regression_summary: "Regression proof will appear once the selected fix is reviewed."
  },
  postmortem: {
    summary: "Postmortem will be written after the run completes.",
    path: "pending"
  },
  skill: {
    summary: `ReplayX is learning from: ${issueText}`,
    path: "pending"
  },
  beforeAfter: {
    before: issueText,
    after: "The final verification result will appear here."
  },
  demoSummary: "ReplayX live run is queued."
});

const nowIso = (): string => new Date().toISOString();

const resolveOptions = (options: LiveRunOptions = {}) => {
  const repoRoot = options.repoRoot ?? defaultRepoRoot;

  return {
    repoRoot,
    runStoreRoot: options.runStoreRoot ?? path.join(repoRoot, ".replayx-runs"),
    artifactsRoot: options.artifactsRoot ?? path.join(repoRoot, "artifacts"),
    phaseDelayMs:
      options.phaseDelayMs ?? Number(process.env.REPLAYX_LIVE_PHASE_DELAY_MS ?? "800")
  };
};

const runPath = (runId: string, options: Required<LiveRunOptions>): string =>
  path.join(options.runStoreRoot, `${runId}.json`);

const sleep = (ms: number): Promise<void> =>
  ms > 0 ? new Promise((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

const createRunId = (): string =>
  `run_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const inferIncidentPath = (repoRoot: string, text: string): string => {
  const normalized = text.toLowerCase();
  const incidentFile = normalized.includes("auth") || normalized.includes("token") || normalized.includes("session")
    ? "auth-token-session-failure.json"
    : normalized.includes("null") || normalized.includes("tax") || normalized.includes("summary")
      ? "null-data-shape-failure.json"
      : "checkout-race-condition.json";

  return path.join(repoRoot, "incidents", incidentFile);
};

const loadNormalizedIncidentFile = async (incidentPath: string): Promise<NormalizedIncident> => {
  const text = await fs.readFile(incidentPath, "utf8");
  return JSON.parse(text) as NormalizedIncident;
};

const importRepoModule = async <T>(repoRoot: string, modulePath: string): Promise<T> => {
  const absolutePath = path.join(repoRoot, modulePath);
  return import(/* webpackIgnore: true */ pathToFileURL(absolutePath).href) as Promise<T>;
};

const readRun = async (runId: string, options: Required<LiveRunOptions>): Promise<ReplayXLiveRun> => {
  const text = await fs.readFile(runPath(runId, options), "utf8");
  return JSON.parse(text) as ReplayXLiveRun;
};

const writeRun = async (run: ReplayXLiveRun, options: Required<LiveRunOptions>): Promise<void> => {
  await fs.mkdir(options.runStoreRoot, { recursive: true });
  await fs.writeFile(runPath(run.runId, options), `${JSON.stringify(run, null, 2)}\n`, "utf8");
};

const updatePhase = async (
  run: ReplayXLiveRun,
  phaseId: ReplayXPhaseId,
  status: LivePhaseStatus,
  summary: string,
  options: Required<LiveRunOptions>
): Promise<ReplayXLiveRun> => {
  const timestamp = nowIso();
  const phases = run.phases.map((phase) => {
    if (phase.id !== phaseId) {
      return phase;
    }

    return {
      ...phase,
      status,
      summary,
      startedAt: status === "running" && !phase.startedAt ? timestamp : phase.startedAt,
      completedAt: status === "completed" || status === "failed" ? timestamp : phase.completedAt
    };
  });

  const nextRun: ReplayXLiveRun = {
    ...run,
    status: status === "failed" ? "failed" : status === "completed" ? run.status : "running",
    currentPhaseId: phaseId,
    updatedAt: timestamp,
    phases
  };

  await writeRun(nextRun, options);
  await sleep(options.phaseDelayMs);
  return nextRun;
};

export const createReplayXRun = async (
  input: CreateReplayXRunInput,
  rawOptions: LiveRunOptions = {}
): Promise<ReplayXLiveRun> => {
  const options = resolveOptions(rawOptions);
  const incidentPath = inferIncidentPath(options.repoRoot, input.text);
  const incident = await loadNormalizedIncidentFile(incidentPath);
  const timestamp = nowIso();
  const run: ReplayXLiveRun = {
    schemaVersion: 1,
    runId: createRunId(),
    source: input.source,
    status: "queued",
    incidentId: incident.incidentId,
    incidentPath,
    currentPhaseId: null,
    issue: {
      text: input.text,
      channel: input.channel ?? null,
      threadTs: input.threadTs ?? null,
      user: input.user ?? null
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    completedAt: null,
    error: null,
    phases: livePhaseDefinitions.map((phase) => ({
      ...phase,
      status: "queued",
      startedAt: null,
      completedAt: null,
      summary: "Waiting to start."
    })),
    cards: pendingCards(input.text)
  };

  await writeRun(run, options);
  return run;
};

export const getReplayXRun = async (
  runId: string,
  rawOptions: LiveRunOptions = {}
): Promise<ReplayXLiveRun> => readRun(runId, resolveOptions(rawOptions));

export const runReplayXLivePipeline = async (
  runId: string,
  rawOptions: LiveRunOptions = {}
): Promise<ReplayXLiveRun> => {
  const options = resolveOptions(rawOptions);
  type IncidentIntakeModule = typeof import("../../orchestrator/phases/incident-intake.js");
  type SkillMatchModule = typeof import("../../orchestrator/phases/skill-match.js");
  type ReproModule = typeof import("../../orchestrator/phases/repro.js");
  type DiagnosisArenaModule = typeof import("../../orchestrator/phases/diagnosis-arena.js");
  type ChallengerValidationModule = typeof import("../../orchestrator/phases/challenger-validation.js");
  type FixArenaModule = typeof import("../../orchestrator/phases/fix-arena.js");
  type ReviewAndRegressionModule = typeof import("../../orchestrator/phases/review-and-regression.js");
  type PostmortemAndSkillModule = typeof import("../../orchestrator/phases/postmortem-and-skill.js");

  const [
    incidentIntake,
    skillMatch,
    repro,
    diagnosisArena,
    challengerValidation,
    fixArena,
    reviewAndRegression,
    postmortemAndSkill
  ] = await Promise.all([
    importRepoModule<IncidentIntakeModule>(options.repoRoot, "orchestrator/phases/incident-intake.ts"),
    importRepoModule<SkillMatchModule>(options.repoRoot, "orchestrator/phases/skill-match.ts"),
    importRepoModule<ReproModule>(options.repoRoot, "orchestrator/phases/repro.ts"),
    importRepoModule<DiagnosisArenaModule>(options.repoRoot, "orchestrator/phases/diagnosis-arena.ts"),
    importRepoModule<ChallengerValidationModule>(options.repoRoot, "orchestrator/phases/challenger-validation.ts"),
    importRepoModule<FixArenaModule>(options.repoRoot, "orchestrator/phases/fix-arena.ts"),
    importRepoModule<ReviewAndRegressionModule>(options.repoRoot, "orchestrator/phases/review-and-regression.ts"),
    importRepoModule<PostmortemAndSkillModule>(options.repoRoot, "orchestrator/phases/postmortem-and-skill.ts")
  ]);
  let run = await readRun(runId, options);
  const incident = await loadNormalizedIncidentFile(run.incidentPath);
  const runtime: ReplayXRuntimeConfig = {
    repoRoot: options.repoRoot,
    artifactsRoot: options.artifactsRoot,
    defaultModel: process.env.REPLAYX_CODEX_MODEL ?? "gpt-5-codex",
    maxParallelWorkers: 4,
    codexReproWorkerEnabled: process.env.REPLAYX_LIVE_USE_CODEX_WORKERS === "1",
    codexReproWorkerTimeoutMs: Number(process.env.REPLAYX_CODEX_REPRO_TIMEOUT_MS ?? "30000"),
    codexDiagnosisWorkersEnabled: process.env.REPLAYX_LIVE_USE_CODEX_WORKERS === "1",
    codexDiagnosisWorkerTimeoutMs: Number(process.env.REPLAYX_CODEX_DIAGNOSIS_TIMEOUT_MS ?? "45000")
  };

  try {
    const normalizedPath = path.join(runtime.artifactsRoot, incident.incidentId, "normalized_incident.json");

    run = await updatePhase(run, "incident-intake", "running", "Normalizing Slack report into ReplayX incident contract.", options);
    const intakeResult = incidentIntake.runIncidentIntakePhase(run.incidentPath, normalizedPath, incident);
    await incidentIntake.writeIncidentIntakeArtifacts(runtime, incident, intakeResult);
    run = await updatePhase(run, "incident-intake", "completed", "Incident contract normalized.", options);

    run = await updatePhase(run, "skill-match", "running", "Checking reusable incident skills before worker fan-out.", options);
    const skillMatchResult = await skillMatch.runSkillMatchPhase(runtime, incident);
    await skillMatch.writeSkillMatchArtifacts(runtime, incident, skillMatchResult);
    run = await updatePhase(run, "skill-match", "completed", skillMatchResult.rationale, options);

    run = await updatePhase(run, "repro", "running", "Running the repro and healthy control checks.", options);
    const reproResult = await repro.runReproPhase(incident, runtime);
    await repro.writeReproArtifacts(runtime, incident, reproResult);
    run = await updatePhase(run, "repro", "completed", reproResult.failure_surface, options);

    run = await updatePhase(run, "diagnosis-arena", "running", "Fan-out diagnosis workers are comparing root causes.", options);
    const diagnosisResult = await diagnosisArena.runDiagnosisArenaPhase(incident, runtime, reproResult);
    await diagnosisArena.writeDiagnosisArenaArtifacts(runtime, incident, diagnosisResult);
    run = {
      ...(await updatePhase(run, "diagnosis-arena", "completed", `${diagnosisResult.worker_count} diagnosis workers produced a ranked shortlist.`, options)),
      cards: {
        ...run.cards,
        workerCards: diagnosisResult.worker_results.map((worker) => ({
          worker: worker.worker_id,
          specialty: worker.specialty,
          diagnosis: worker.output.diagnosis,
          confidence: worker.output.confidence,
          status: worker.output.status
        }))
      }
    };
    await writeRun(run, options);

    run = await updatePhase(run, "challenger-validation", "running", "Challenger is trying to falsify the strongest diagnosis.", options);
    const challengerResult = challengerValidation.runChallengerValidationPhase(incident, diagnosisResult);
    await challengerValidation.writeChallengerValidationArtifacts(runtime, incident, challengerResult);
    run = {
      ...(await updatePhase(run, "challenger-validation", "completed", challengerResult.winning_reason, options)),
      cards: {
        ...run.cards,
        winningDiagnosis: {
          worker: challengerResult.winner ?? "no_clear_winner",
          diagnosis: diagnosisResult.ranked_shortlist[0]?.diagnosis ?? incident.summary.symptom,
          confidence: diagnosisResult.ranked_shortlist[0]?.confidence ?? 0,
          winning_reason: challengerResult.winning_reason
        }
      }
    };
    await writeRun(run, options);

    run = await updatePhase(run, "fix-arena", "running", "Fix strategies are being ranked by safety and proof.", options);
    const fixResult = fixArena.runFixArenaPhase(incident, diagnosisResult, challengerResult);
    await fixArena.writeFixArenaArtifacts(runtime, incident, fixResult);
    run = await updatePhase(run, "fix-arena", "completed", fixResult.winner_summary, options);

    run = await updatePhase(run, "review-and-regression", "running", "Review is turning the proposal into a regression proof plan.", options);
    const reviewResult = reviewAndRegression.runReviewAndRegressionPhase(incident, fixResult);
    await reviewAndRegression.writeReviewAndRegressionArtifacts(runtime, incident, reviewResult);
    run = await updatePhase(run, "review-and-regression", "completed", reviewResult.regression_proof.demo_summary, options);

    run = await updatePhase(run, "postmortem-and-skill", "running", "Writing postmortem and reusable skill.", options);
    const artifactResult = await postmortemAndSkill.runPostmortemAndSkillPhase(
      runtime,
      incident,
      diagnosisResult,
      challengerResult,
      fixResult,
      reviewResult
    );
    await postmortemAndSkill.writePostmortemAndSkillArtifacts(runtime, incident, artifactResult);

    const replayText = await fs.readFile(
      path.join(runtime.artifactsRoot, incident.incidentId, "dashboard-replay.json"),
      "utf8"
    );
    const replay = JSON.parse(replayText) as ReplayXDashboardReplayArtifact;
    run = await updatePhase(run, "postmortem-and-skill", "completed", artifactResult.skill_summary, options);

    const completedRun: ReplayXLiveRun = {
      ...run,
      status: "completed",
      currentPhaseId: "postmortem-and-skill",
      updatedAt: nowIso(),
      completedAt: nowIso(),
      cards: {
        workerCards: replay.worker_cards,
        winningDiagnosis: replay.winner_card,
        fix: replay.fix_card,
        proof: replay.proof_card,
        postmortem: replay.postmortem_card,
        skill: replay.skill_card,
        beforeAfter: replay.before_after,
        demoSummary: replay.demo_summary
      }
    };

    await writeRun(completedRun, options);
    return completedRun;
  } catch (error) {
    const failedRun: ReplayXLiveRun = {
      ...run,
      status: "failed",
      updatedAt: nowIso(),
      error: error instanceof Error ? error.message : "Unknown ReplayX live run failure"
    };
    await writeRun(failedRun, options);
    return failedRun;
  }
};

export const startReplayXLivePipeline = (runId: string, options: LiveRunOptions = {}): void => {
  void runReplayXLivePipeline(runId, options);
};
