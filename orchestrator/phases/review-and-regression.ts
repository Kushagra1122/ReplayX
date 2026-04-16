import type { ReplayXPhaseDefinition } from "../types.js";

export const reviewAndRegressionPhase: ReplayXPhaseDefinition = {
  id: "review-and-regression",
  label: "Review And Regression Proof",
  goal: "Review the winning patch and verify the incident is actually addressed.",
  requiredVerificationCommand: "TODO: add review and regression proof execution in Phase 8.",
  requiredOutputSchema: "phase.review-and-regression.json",
  artifactOutputs: ["phase.review-and-regression.json", "verification.review.log"],
  dependsOn: ["fix-arena"],
  status: "pending",
  implementationNotes:
    "TODO: implement review veto rules and regression proof generation."
};
