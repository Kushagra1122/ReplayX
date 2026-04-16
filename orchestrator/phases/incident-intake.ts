import type { ReplayXPhaseDefinition } from "../types.js";

export const incidentIntakePhase: ReplayXPhaseDefinition = {
  id: "incident-intake",
  label: "Incident Intake",
  goal: "Normalize the incident bundle into the strict ReplayX input contract.",
  requiredVerificationCommand: "TODO: wire the intake verifier once incident normalization exists.",
  requiredOutputSchema: "normalized_incident.json",
  artifactOutputs: ["normalized_incident.json"],
  dependsOn: [],
  status: "pending",
  implementationNotes:
    "TODO: implement the normalization module and seeded incident loaders in Phase 2 work."
};
