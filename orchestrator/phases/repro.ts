import type { ReplayXPhaseDefinition } from "../types.js";

export const reproPhase: ReplayXPhaseDefinition = {
  id: "repro",
  label: "Repro And Environment Verification",
  goal: "Confirm the failure surface or record why reproduction is currently blocked.",
  requiredVerificationCommand: "TODO: add the bounded repro command runner in Phase 4.",
  requiredOutputSchema: "phase.repro.json",
  artifactOutputs: ["phase.repro.json", "verification.repro.log"],
  dependsOn: ["incident-intake", "skill-match"],
  status: "pending",
  implementationNotes:
    "TODO: implement the repro worker and environment checks after the incident contract lands."
};
