# ReplayX Pipeline

This file is the canonical workflow summary for ReplayX.

ReplayX runs a deterministic incident workflow with auditable artifacts at every phase. The orchestrator coordinates bounded workers, machine-readable outputs, and verification gates.

## Workflow phases

1. Incident intake
Normalize the incident bundle into a strict input contract with incident metadata, primary evidence, code context, constraints, and required commands.

2. Fast-path skill match
Check whether an existing ReplayX skill matches the incident closely enough to skip the full arena. Use the short path only when confidence is high.

3. Repro and environment verification
Confirm the failure surface in the current environment, or record exactly why repro is blocked and what uncertainty remains.

4. Diagnosis arena
Run bounded diagnosis workers in parallel. Prefer evidence density, disproof, and concrete checks over broad speculation.

5. Challenger validation
Take the strongest diagnosis candidates and try to falsify them. Do not accept a root cause without surviving counter-checks.

6. Fix arena
Run bounded fix workers in parallel, typically minimal, safest, and durable variants. Prefer correctness and low blast radius over larger refactors.

7. Review and regression proof
Review the winning patch, verify the incident is actually addressed, and veto the fix if regression risk is not justified.

8. Postmortem and skill writing
Emit human-readable postmortem artifacts and a reusable ReplayX skill when the incident class should be captured for future runs.

## Phase output rules

Every downstream worker payload must include:

- phase goal
- exact scope
- required verification command
- required output schema

Every phase should preserve artifacts on disk so the run is inspectable and replayable.

## Core operating rules

- Prefer bounded specialist workers over one large unstructured run.
- Use strict machine-readable outputs between phases.
- Never accept a diagnosis without evidence.
- Never accept a fix without verification.
- Never let one worker failure terminate the run if the phase can continue with remaining evidence.
- Keep worker prompts concise and operational.

## Expected artifacts

- normalized incident bundle
- per-phase JSON outputs
- verification logs
- diff and review artifacts
- final postmortem
- reusable skill artifact

## Current implementation note

The current repository contains an initial `orchestrator/` scaffold with TypeScript contracts and per-phase placeholders. Treat this document as the execution contract for filling those modules with real implementation.
