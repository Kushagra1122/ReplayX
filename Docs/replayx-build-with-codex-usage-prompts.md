# ReplayX Build-With-Codex Usage Prompts

## Purpose

This file is not for ReplayX's internal runtime.

It is for you, the operator, to use with Codex while building ReplayX for the hackathon.

Use these prompts in sequence. Each one tells Codex what to build next in this repository.

They are designed to:

- build ReplayX itself
- stay Codex-first
- keep work hackathon-scoped and demo-oriented

## How To Use This File

Use one prompt at a time in Codex.

After each phase:

1. let Codex finish implementation
2. review the diff
3. run the relevant verification
4. move to the next prompt

Do not dump the entire file into Codex at once. The prompts are intentionally phased.

## What To Reuse From Older Plans

The older plan in `/Users/sourabhkapure/Desktop/REPLAYX_COMPLETE_PLAN.md` contains strong hackathon material.

Keep these parts:

- the product framing and one-line pitch
- the seeded-incident approach
- the dashboard-first demo thinking
- the pre-recorded fallback idea
- the hour-by-hour build discipline
- the 2-minute demo script structure

Do not reuse these parts as implementation direction:

- OpenAI Agents SDK as the orchestration backbone
- sandbox-agent architecture assumptions
- agent handoff or agent framework primitives as the center of ReplayX

Use the older plan for presentation quality. Use the Codex-first docs for implementation.

## Current Progress Note

The repository is already through the early setup phases:

- scaffold exists
- incident fixtures exist
- demo app exists
- basic operator docs exist

The next important transition is this:

- actual Codex SDK integration starts when the repro, diagnosis, challenger, and fix phases are implemented

So if you are checking whether ReplayX is "already integrated with Codex," the precise answer is:

- architecturally yes
- in code, the real Codex worker integration begins in the next phases

## Prompt Quality Rules For Build Prompts

Use these rules when pasting later-phase prompts into Codex:

1. One build objective per prompt.
2. Keep reusable instructions at the top and dynamic repo state later.
3. Ask for concrete deliverables, artifacts, and verification.
4. Tell Codex what not to do, not just what to do.
5. Prefer bounded ownership over "implement everything" phrasing.
6. Ask Codex to preserve machine-readable outputs where later phases depend on them.

## Context Pack Rules For Build Prompts

When running a later-phase build prompt, include only:

- the relevant phase prompt
- the current implementation files for that phase
- the nearest incident fixtures or demo-app files
- the verification commands for that phase

Do not include the whole repository unless the phase actually needs it.

## Global Build Prompt

Use this once at the start of a fresh Codex session.

```text
We are building ReplayX for a Codex hackathon.

ReplayX is a Codex-first incident response system that turns an incident bundle into:
- ranked diagnosis
- validated fix
- reviewed patch
- regression proof
- postmortem
- reusable skill

Hard constraints:
- Do not use OpenAI Agents SDK as the core runtime.
- Prefer @openai/codex-sdk for orchestration.
- Prefer Codex CLI for codex exec automation and reproducible local runs.
- Keep the build hackathon-scoped.
- Optimize for one strong end-to-end demo, not framework breadth.
- Read AGENTS.md and Docs/replayx-codex-first-architecture.md before making changes.
- Follow Docs/replayx-codex-first-prompts.md for ReplayX's internal phase prompts.

Working style:
- Read the repo first.
- Make concrete code changes, not just plans.
- Keep the diff minimal but complete.
- Run the narrowest useful verification after each batch.
- If something is missing from the repo, scaffold it.
- Do not reintroduce openai-agents, handoffs, sandbox agents, or agent-framework abstractions.
```

## Phase 1 Prompt: Scaffold The Repo

Use this first.

```text
Build the initial ReplayX hackathon repo scaffold in this repository.

Goal:
Create the directory and file structure needed for a Codex-first ReplayX implementation.

Create at least:
- orchestrator/
- orchestrator/main.ts
- orchestrator/types.ts
- orchestrator/phases/
- incidents/
- skills/
- demo_app/
- dashboard/
- package.json
- tsconfig.json
- .gitignore
- README.md updates if needed

Requirements:
- Node.js and TypeScript first
- @openai/codex-sdk as the intended orchestration dependency
- leave clear TODO markers only where implementation depends on future phase work
- do not use OpenAI Agents SDK

Also:
- update AGENTS.md only if the new file structure needs concrete repo instructions
- keep the scaffold aligned to Docs/replayx-codex-first-architecture.md

Verification:
- package.json exists
- TypeScript config exists
- repo structure is coherent

Stop only when the scaffold is in place and summarized.
```

## Phase 2 Prompt: Build The Incident Contract

```text
Implement the ReplayX incident intake layer.

Goal:
Define the normalized incident bundle contract and create seeded incident fixtures for the hackathon demo.

Requirements:
- create a strict TypeScript type for normalized incidents
- create a normalization module under orchestrator/
- create at least 3 seeded incident JSON fixtures under incidents/
- fixtures should represent:
  1. checkout race condition
  2. auth token/session failure
  3. null/data-shape failure
- keep the incidents realistic but hackathon-manageable

Do not:
- build the whole orchestrator yet
- add extra infrastructure beyond the incident contract and fixtures

Verification:
- the JSON fixtures parse
- the normalization code validates and loads them

Return:
- files added
- contract summary
- verification result
```

## Phase 3 Prompt: Build The Demo App

```text
Implement the hackathon demo application for ReplayX.

Goal:
Create a small app that ReplayX can diagnose and fix during the demo.

Requirements:
- use a simple stack that is easy to run locally
- include intentionally planted incident classes aligned to the seeded incidents
- keep the app small and deterministic
- add only the minimum needed to support the ReplayX demo

Preferred bugs:
- race/concurrency bug in checkout or inventory
- auth/session or token-expiry bug
- null/data-shape bug

Output:
- demo_app with runnable structure
- clear mapping from each seeded incident to an intentionally planted bug

Do not:
- over-engineer the app
- introduce production-grade complexity beyond demo needs

Verification:
- app starts
- each seeded incident corresponds to an actual failing behavior or code path
```

## Phase 3.5 Prompt: Add Pre-Seeding Checklist

```text
Add a concise hackathon pre-seeding checklist to the repository docs.

Goal:
Make sure the team can prepare the demo before hackathon day and avoid live setup failures.

The checklist should cover:
- environment setup
- seeded incidents
- demo app verification
- one end-to-end dry run
- fallback event recording for the dashboard

Keep it short and practical.

Put it in the most sensible Markdown file for operators.
```

### Hackathon Pre-Seeding Checklist

- Environment setup
  Confirm `pnpm install` has been run, Node meets the repo requirement, and the team can start both the ReplayX repo and the demo app from a clean shell.
- Seeded incidents
  Open the three incident fixtures in `incidents/` and confirm the incident ids, failing commands, and suspected files still match the current demo app paths.
- Demo app verification
  Start the app with `pnpm demo-app`, hit `/health`, and rerun the three repro commands so each seeded failure still reproduces and each healthy control still passes.
- End-to-end dry run
  Run one full narrated practice incident from intake through bug repro, expected diagnosis target, intended fix area, and final artifact/story so the operator flow is stable.
- Fallback dashboard recording
  Capture one clean fallback run before demo day: terminal output, failing and healthy route results, and any dashboard-ready screenshots or saved JSON/event artifacts needed if live execution is flaky.

## Phase 4 Prompt: Build Repro Phase

```text
Implement Phase 2 of ReplayX: repro and environment verification.

Goal:
Given a normalized incident, ReplayX should narrow the failure surface and produce a machine-readable repro result.

Requirements:
- add a repro phase module under orchestrator/phases/
- use Codex-first patterns, not Agents SDK patterns
- this is the point where real Codex SDK-backed worker execution can start entering the codebase
- define exact output JSON structure for this phase
- wire it so orchestrator/main.ts can invoke it
- if the demo app needs a simple helper script or command to support repro, add it
- keep a safe local fallback path if the Codex worker is unavailable or times out

The phase should output at least:
- repro_confirmed
- verification_status
- failure_surface
- repro_command
- candidate_files
- confidence
- blocked_reason

Verification:
- phase can run against at least one seeded incident
- output is structured and usable by later phases

Done when:
- `--phase repro` executes successfully
- JSON output is emitted to stdout or artifacts
- the failing and healthy controls are both captured
- the phase can continue even if the Codex worker is skipped or fails
```

## Phase 5 Prompt: Build Diagnosis Arena

```text
Implement the ReplayX diagnosis arena in a Codex-first way.

Goal:
Run a bounded set of diagnosis workers and rank candidate root causes.

Requirements:
- do not use OpenAI Agents SDK
- use ReplayX-owned orchestration with @openai/codex-sdk as the intended runtime model
- this phase should introduce the first real bounded Codex worker fan-out for the project
- define 4 to 8 strong diagnosis worker specializations for the hackathon build
- each worker must return structured JSON
- include ranking logic
- keep the implementation inspectable and easy to demo
- use one Codex thread per worker or another equally explicit isolation model
- prefer structured outputs via `outputSchema`
- preserve raw worker artifacts or summaries for later challenger use

Worker output should include:
- diagnosis
- confidence
- observations
- commands_run
- candidate_files
- falsification_note
- status

Also:
- map the worker prompts to Docs/replayx-codex-first-prompts.md
- keep prompt definitions versioned in code or dedicated prompt files

Verification:
- arena can execute over a seeded incident input path
- ranking output is deterministic enough for demo use

Done when:
- the arena can run more than one worker
- each worker returns machine-readable output
- a ranked shortlist is produced
- later phases can consume the shortlist without manual interpretation
```

## Phase 6 Prompt: Build Challenger Validation

```text
Implement the ReplayX challenger phase.

Goal:
Take the top diagnosis candidates and try to disprove them before the fix arena runs.

Requirements:
- build this as a separate phase module
- accept ranked diagnosis results
- return validated and rejected candidates in a structured result
- keep the logic hackathon-simple but real
- optimize for explaining the phase clearly to judges
- prefer counter-checks and falsification logic over generic commentary

Do not:
- add framework abstractions
- overbuild evaluation systems

Verification:
- challenger can process mocked diagnosis results
- output structure matches the prompt pack

Done when:
- at least one candidate can be rejected for a concrete reason
- surviving candidates are clearly separated from rejected ones
- the output is machine-readable and ready for fix selection
```

## Phase 7 Prompt: Build Fix Arena

```text
Implement the ReplayX fix arena.

Goal:
Run three bounded fix strategies in parallel:
- minimal_fix
- safe_fix
- durable_fix

Requirements:
- Codex-first orchestration
- structured outputs
- scoring logic
- rollback note
- blast radius note
- verification result capture
- use bounded worker isolation between minimal_fix, safe_fix, and durable_fix
- use output schemas or equivalently strict JSON parsing for worker results
- preserve candidate fix artifacts for later review

The fix arena should accept:
- validated diagnosis
- allowed edit scope
- verification command

It should return:
- strategy
- summary
- files_changed
- verification_result
- blast_radius
- rollback_note
- risk_note
- score
- status

Keep the hackathon focus:
- make it work for the seeded incidents
- avoid generalized framework code

Verification:
- fix arena can run on a mocked validated diagnosis
- scoring and winner selection work

Done when:
- all three strategies can be invoked independently
- verification result is captured for each strategy
- a winner is selected without manual judgment
```

## Phase 8 Prompt: Build Review And Regression Proof

```text
Implement the ReplayX review phase and regression-proof phase.

Goal:
After a winning fix is selected, ReplayX should:
- review the change
- identify findings or pass it
- add or specify a regression proof

Requirements:
- separate review output from test-writing output
- align output shapes with Docs/replayx-codex-first-prompts.md
- keep the implementation small and hackathon-usable
- findings must come first in review output
- regression proof must be narrow and incident-specific

Verification:
- review phase can process a mock fix result
- regression-proof phase can target at least one seeded incident class

Done when:
- review can pass or fail a candidate fix
- regression proof is explicit enough to automate later
```

## Phase 9 Prompt: Build Skill Writer And Postmortem

```text
Implement the final ReplayX artifact phases.

Goal:
Generate:
- reusable skill artifact
- concise postmortem

Requirements:
- write skills under skills/
- use a simple YAML or JSON schema
- keep the schema precise enough for future fast-path matching
- postmortem should separate facts from inference
- use only validated upstream artifacts, not guessed narratives

Verification:
- skill artifact is created for a mocked successful run
- postmortem output is generated from structured run data

Done when:
- a reusable skill artifact lands on disk
- a concise postmortem lands on disk
- both are derived from the actual run outputs
```

## Phase 10 Prompt: Wire End-To-End Orchestrator

```text
Wire the ReplayX orchestrator end to end.

Goal:
Make orchestrator/main.ts run the full hackathon path:
1. load incident
2. normalize incident
3. fast-path skill match
4. repro phase
5. diagnosis arena
6. challenger
7. fix arena
8. review
9. regression proof
10. postmortem and skill writing

Requirements:
- keep phase boundaries explicit
- persist or log structured outputs between phases
- make the run easy to inspect during a demo
- avoid hidden magic
- preserve phase artifacts for replay and judging
- keep the main path deterministic for the seeded incidents

Verification:
- one seeded incident can run through the full path
- output artifacts are visible on disk or in console output

Done when:
- one seeded incident completes the full path
- each phase leaves a usable artifact
- the operator can narrate the flow from artifacts alone
```

## Phase 11 Prompt: Build Hackathon Dashboard

```text
Build the smallest useful ReplayX dashboard for the hackathon demo.

Goal:
Create a UI that makes the ReplayX pipeline understandable in under 30 seconds.

It should show:
- incident summary
- diagnosis candidates
- challenger outcome
- fix arena strategies and scores
- winning fix
- generated skill
- postmortem summary

Requirements:
- keep it simple and visually clear
- do not spend time on unnecessary polish if the backend path is not done
- if live streaming is too expensive, use replayable structured run artifacts

Verification:
- dashboard can render a completed run artifact
```

## Phase 11.5 Prompt: Add Event Schema And Replay Mode

```text
Add the smallest useful event schema and replay mode for the ReplayX dashboard.

Goal:
Make the dashboard work in two modes:
- live mode from a running ReplayX pipeline
- replay mode from a saved event file

Requirements:
- define a compact event schema
- include events for:
  - pipeline start
  - phase transitions
  - diagnosis worker updates
  - challenger result
  - fix scores
  - winner selected
  - skill written
  - pipeline complete
- keep the replay path dead simple so it is a reliable hackathon fallback

Verification:
- dashboard can render a mocked saved event stream end to end
```

## Phase 12 Prompt: Build Demo Script And Judging Flow

```text
Create the ReplayX hackathon demo flow.

Goal:
Package the project so the demo is reliable and easy to narrate.

Deliver:
- one recommended demo incident
- exact commands to run the demo
- fallback plan if live inference fails
- 60-second explanation of the architecture
- 30-second explanation of why Codex-first is the correct choice

Also:
- add a concise demo section to README.md
- make the script optimized for judges, not engineers only

Verification:
- commands are coherent
- fallback path exists
- the story is crisp
```

## Phase 13 Prompt: Package The Submission Story

```text
Prepare the final hackathon submission story for ReplayX.

Goal:
Make the repo and demo read like a winning product, not just an engineering experiment.

Deliver:
- a 1-line pitch
- a 3-line product explanation
- a short "why Codex-first" explanation
- a short "why this matters" explanation
- a concise README section for judges

Use the strongest parts of the older hackathon plan for product storytelling, but keep all implementation claims aligned with the current Codex-first architecture.

Do not mention OpenAI Agents SDK as the core runtime.
```

## Sources

Use these as reference while building:

- `Docs/replayx-codex-first-architecture.md`
- `Docs/replayx-codex-first-prompts.md`

Official OpenAI references:

- Codex SDK: https://developers.openai.com/codex/sdk
- Codex CLI: https://developers.openai.com/codex/cli
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex best practices: https://developers.openai.com/codex/learn/best-practices
- Prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering
- Prompt caching guide: https://developers.openai.com/api/docs/guides/prompt-caching
