import path from "node:path";
import process from "node:process";

import { replayXPhases } from "./phases/index.js";
import type { ReplayXIncidentPointer, ReplayXRunPlan, ReplayXRuntimeConfig } from "./types.js";

const defaultRuntimeConfig = (repoRoot: string): ReplayXRuntimeConfig => ({
  repoRoot,
  artifactsRoot: path.join(repoRoot, "artifacts"),
  defaultModel: "GPT-5-Codex",
  maxParallelWorkers: 4
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

export const main = (): void => {
  const incidentArg = process.argv[2];
  const runPlan = buildReplayXRunPlan(incidentArg);

  console.log(renderRunPlan(runPlan));
};

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
