import type { ReplayXPhaseDefinition } from "../types.js";

export const postmortemAndSkillPhase: ReplayXPhaseDefinition = {
  id: "postmortem-and-skill",
  label: "Postmortem And Skill Writer",
  goal: "Emit human-readable incident artifacts and a reusable ReplayX skill.",
  requiredVerificationCommand: "TODO: add postmortem and skill artifact generation in Phase 9.",
  requiredOutputSchema: "phase.postmortem-and-skill.json",
  artifactOutputs: ["phase.postmortem-and-skill.json", "postmortem.md", "skill.yaml"],
  dependsOn: ["review-and-regression"],
  status: "pending",
  implementationNotes:
    "TODO: implement the artifact writers once upstream phase outputs are real."
};
