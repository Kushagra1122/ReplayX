import type { ReplayXPhaseDefinition } from "../types.js";

export const skillMatchPhase: ReplayXPhaseDefinition = {
  id: "skill-match",
  label: "Fast-Path Skill Match",
  goal: "Check whether an existing ReplayX skill can handle the incident without a full arena run.",
  requiredVerificationCommand: "TODO: wire the skill match scorer once the skill catalog schema exists.",
  requiredOutputSchema: "phase.skill-match.json",
  artifactOutputs: ["phase.skill-match.json"],
  dependsOn: ["incident-intake"],
  status: "pending",
  implementationNotes:
    "TODO: implement skill catalog loading and confidence scoring in a later phase."
};
