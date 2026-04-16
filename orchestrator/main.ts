import path from "node:path";
import process from "node:process";

import { loadNormalizedIncident } from "./normalize-incident.js";
import { replayXPhases } from "./phases/index.js";
import {
  runChallengerValidationPhase,
  writeChallengerValidationArtifacts
} from "./phases/challenger-validation.js";
import {
  runDiagnosisArenaPhase,
  writeDiagnosisArenaArtifacts
} from "./phases/diagnosis-arena.js";
import { runReproPhase, writeReproArtifacts } from "./phases/repro.js";
import type { ReplayXIncidentPointer, ReplayXRunPlan, ReplayXRuntimeConfig } from "./types.js";

const defaultRuntimeConfig = (repoRoot: string): ReplayXRuntimeConfig => ({
  repoRoot,
  artifactsRoot: path.join(repoRoot, "artifacts"),
  defaultModel: "GPT-5-Codex",
  maxParallelWorkers: 4,
  codexReproWorkerEnabled: process.env.REPLAYX_USE_CODEX_REPRO_WORKER !== "0",
  codexReproWorkerTimeoutMs: Number(process.env.REPLAYX_CODEX_REPRO_TIMEOUT_MS ?? "8000"),
  codexDiagnosisWorkersEnabled: process.env.REPLAYX_USE_CODEX_DIAGNOSIS_WORKERS !== "0",
  codexDiagnosisWorkerTimeoutMs: Number(process.env.REPLAYX_CODEX_DIAGNOSIS_TIMEOUT_MS ?? "10000")
});

const deriveIncidentPointer = (repoRoot: string, incidentArg?: string): ReplayXIncidentPointer => {
  const incidentId = incidentArg ? path.basename(incidentArg, path.extname(incidentArg)) : "seeded-incident";
  const inputPath = incidentArg ? path.resolve(repoRoot, incidentArg) : path.join(repoRoot, "incidents");

  return {
    incidentId,
    inputPath,
    normalizedPath: path.join(repoRoot, "artifacts", incidentId, "normalized_incident.json")
  };
};

export const buildReplayXRunPlan = (incidentArg?: string): ReplayXRunPlan => {
  const repoRoot = process.cwd();

  return {
    incident: deriveIncidentPointer(repoRoot, incidentArg),
    runtime: defaultRuntimeConfig(repoRoot),
    phases: replayXPhases
  };
};

const renderRunPlan = (plan: ReplayXRunPlan): string => {
  const phaseLines = plan.phases.map((phase, index) => {
    const dependencyLabel = phase.dependsOn.length > 0 ? phase.dependsOn.join(", ") : "none";

    return `${index + 1}. ${phase.label} [${phase.id}] -> depends on: ${dependencyLabel}`;
  });

  return [
    "ReplayX scaffold is in place.",
    `Incident input: ${plan.incident.inputPath}`,
    `Artifacts root: ${plan.runtime.artifactsRoot}`,
    `Default model: ${plan.runtime.defaultModel}`,
    "",
    "Planned phases:",
    ...phaseLines,
    "",
    "TODO: replace the scaffold run-plan output with real Codex SDK orchestration as the phase modules land."
  ].join("\n");
};

const parseCliArguments = (
  argv: string[]
): {
  phase: string | null;
  incidentPath: string | null;
} => {
  let phase: string | null = null;
  let incidentPath: string | null = null;

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];

    if (argument === "--phase" && argv[index + 1]) {
      phase = argv[index + 1];
      index += 1;
      continue;
    }

    if (argument.startsWith("--phase=")) {
      phase = argument.split("=")[1] ?? null;
      continue;
    }

    if (!argument.startsWith("--") && incidentPath === null) {
      incidentPath = argument;
    }
  }

  return { phase, incidentPath };
};

export const main = async (): Promise<void> => {
  const { phase, incidentPath } = parseCliArguments(process.argv.slice(2));

  if (phase === "repro") {
    if (!incidentPath) {
      throw new Error("Phase 'repro' requires a path to a normalized incident JSON file.");
    }

    const repoRoot = process.cwd();
    const runtime = defaultRuntimeConfig(repoRoot);
    const incident = await loadNormalizedIncident(path.resolve(repoRoot, incidentPath));
    const result = await runReproPhase(incident, runtime);
    const artifacts = await writeReproArtifacts(runtime, incident, result);

    console.log(
      JSON.stringify(
        {
          ...result,
          artifact_paths: artifacts
        },
        null,
        2
      )
    );
    return;
  }

  if (phase === "diagnosis-arena") {
    if (!incidentPath) {
      throw new Error("Phase 'diagnosis-arena' requires a path to a normalized incident JSON file.");
    }

    const repoRoot = process.cwd();
    const runtime = defaultRuntimeConfig(repoRoot);
    const incident = await loadNormalizedIncident(path.resolve(repoRoot, incidentPath));
    const reproResult = await runReproPhase(incident, runtime);
    const reproArtifacts = await writeReproArtifacts(runtime, incident, reproResult);
    const diagnosisResult = await runDiagnosisArenaPhase(incident, runtime, reproResult);
    const diagnosisArtifacts = await writeDiagnosisArenaArtifacts(runtime, incident, diagnosisResult);

    console.log(
      JSON.stringify(
        {
          ...diagnosisResult,
          artifact_paths: {
            repro: reproArtifacts,
            diagnosis: diagnosisArtifacts
          }
        },
        null,
        2
      )
    );
    return;
  }

  if (phase === "challenger-validation" || phase === "challenger") {
    if (!incidentPath) {
      throw new Error(
        "Phase 'challenger-validation' requires a path to a normalized incident JSON file."
      );
    }

    const repoRoot = process.cwd();
    const runtime = defaultRuntimeConfig(repoRoot);
    const incident = await loadNormalizedIncident(path.resolve(repoRoot, incidentPath));
    const reproResult = await runReproPhase(incident, runtime);
    const reproArtifacts = await writeReproArtifacts(runtime, incident, reproResult);
    const diagnosisResult = await runDiagnosisArenaPhase(incident, runtime, reproResult);
    const diagnosisArtifacts = await writeDiagnosisArenaArtifacts(runtime, incident, diagnosisResult);
    const challengerResult = runChallengerValidationPhase(incident, diagnosisResult);
    const challengerArtifacts = await writeChallengerValidationArtifacts(
      runtime,
      incident,
      challengerResult
    );

    console.log(
      JSON.stringify(
        {
          ...challengerResult,
          artifact_paths: {
            repro: reproArtifacts,
            diagnosis: diagnosisArtifacts,
            challenger: challengerArtifacts
          }
        },
        null,
        2
      )
    );
    return;
  }

  const runPlan = buildReplayXRunPlan(incidentPath ?? undefined);
  console.log(renderRunPlan(runPlan));
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(message);
    process.exit(1);
  });
}
