import type { ReplayXPhaseDefinition } from "../types.js";

export const diagnosisArenaPhase: ReplayXPhaseDefinition = {
  id: "diagnosis-arena",
  label: "Diagnosis Arena",
  goal: "Run bounded specialist diagnosis workers and rank the evidence-backed candidates.",
  requiredVerificationCommand:
    "TODO: add deterministic arena evaluation once diagnosis worker prompts are wired.",
  requiredOutputSchema: "phase.diagnosis-arena.json",
  artifactOutputs: ["phase.diagnosis-arena.json"],
  dependsOn: ["repro"],
  status: "pending",
  implementationNotes:
    "TODO: implement the bounded worker fan-out with Codex SDK sessions in Phase 5."
};
