import type { ReplayXPhaseDefinition } from "../types.js";

export const fixArenaPhase: ReplayXPhaseDefinition = {
  id: "fix-arena",
  label: "Fix Arena",
  goal: "Generate bounded patch candidates and retain the safest verified option.",
  requiredVerificationCommand: "TODO: add patch verification orchestration in Phase 7.",
  requiredOutputSchema: "phase.fix-arena.json",
  artifactOutputs: ["phase.fix-arena.json", "candidate.diff"],
  dependsOn: ["challenger-validation"],
  status: "pending",
  implementationNotes:
    "TODO: implement minimal, safe, and durable fix workers after diagnosis is settled."
};
