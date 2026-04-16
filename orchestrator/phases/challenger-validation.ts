import type { ReplayXPhaseDefinition } from "../types.js";

export const challengerValidationPhase: ReplayXPhaseDefinition = {
  id: "challenger-validation",
  label: "Challenger Validation",
  goal: "Try to falsify the strongest diagnoses before a winner is accepted.",
  requiredVerificationCommand: "TODO: add challenger validation checks in Phase 6.",
  requiredOutputSchema: "phase.challenger-validation.json",
  artifactOutputs: ["phase.challenger-validation.json"],
  dependsOn: ["diagnosis-arena"],
  status: "pending",
  implementationNotes:
    "TODO: implement alternative-explanation checks and shortlist ranking."
};
