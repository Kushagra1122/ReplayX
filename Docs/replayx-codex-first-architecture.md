# ReplayX Codex-First Architecture

## Status

Approved direction for the next ReplayX architecture revision.

This document replaces the old OpenAI Agents SDK direction stored under `Docs/Docs- agent-sdk/`.

## Executive Decision

ReplayX should use a Codex-first stack:

- `@openai/codex-sdk` as the primary orchestration runtime
- Codex CLI for non-interactive local execution, repo automation, and review workflows
- optional direct Responses API usage with a Codex coding model only when ReplayX later needs a hosted worker outside the Codex runtime

ReplayX should not use the OpenAI Agents SDK as the core runtime.

## Why This Is The Correct Direction

### 1. ReplayX is fundamentally a coding-agent system

ReplayX is not primarily a conversational agent product. Its hard problems are:

- reading a real codebase
- running shell commands
- editing files
- validating fixes
- comparing candidate patches
- producing engineering artifacts

Those are Codex-native tasks.

Official OpenAI sources currently position Codex and coding models as first-class tools for software engineering work:

- OpenAI lists Codex under Coding agents and Codex SDK under Automation.
- OpenAI’s model catalog has a dedicated Coding section and lists `GPT-5-Codex`, `GPT-5.3-Codex`, and `GPT-5.2-Codex` as models optimized for software engineering tasks.
- OpenAI’s Codex best-practices and AGENTS.md guidance are explicitly about repo-aware coding workflows.

### 2. The old design was over-indexed on agent framework primitives

The older plan used:

- OpenAI Agents SDK
- sandbox agents
- agent handoffs
- function-tool-driven orchestration as the backbone

That adds framework surface area that ReplayX does not need in v1. It also makes the product architecture look like a general-purpose agent framework demo instead of an incident-fixing system.

ReplayX needs reliable execution phases, not a framework-centered story.

### 3. Codex CLI and Codex SDK map directly to ReplayX phases

ReplayX phases naturally become:

- one orchestrator
- several bounded worker runs
- deterministic verification
- review and synthesis

That maps well to:

- Codex SDK sessions / threads for arena workers
- Codex CLI `codex exec` for scripted automation, CI, and reproducible local tasks
- AGENTS.md for durable repo instructions

### 4. OpenAI’s current prompting guidance supports minimal, task-specific coding prompts

Current OpenAI guidance for Codex emphasizes:

- use AGENTS.md for durable instructions
- provide the model with repo context and precise task definition
- keep prompts minimal and operational
- avoid over-prompting Codex

That is a better fit for ReplayX than a large stack of verbose role prompts.

## Recommendation Summary

### Primary recommendation

Use this stack:

- Orchestrator: Node.js + `@openai/codex-sdk`
- Worker execution: Codex SDK worker runs with ReplayX-owned prompt templates
- Local automation: Codex CLI `codex exec`
- Repo policy: `AGENTS.md`
- Evaluation and prompt iteration: OpenAI prompt engineering guidance plus ReplayX’s own regression bundles

### Optional secondary path

If ReplayX later needs a server-side hosted worker that is not running inside Codex CLI or Codex SDK environments, use:

- Responses API
- a coding model from the Codex model family
- ReplayX-managed tools, state, and routing

Do not make Agents SDK the default path unless you later discover a concrete need for its tracing, handoff, or voice-oriented abstractions.

## Hackathon Guidance

For a hackathon build, ReplayX should optimize for clarity and proof, not framework breadth.

The winning shape is:

- one clean orchestrator
- a bounded diagnosis arena
- a challenger
- a bounded fix arena
- a review step
- a postmortem and reusable skill artifact

Do not spend hackathon time building generalized agent abstractions unless they directly improve the demoed incident loop.

## What To Use For ReplayX

### Runtime split

#### Codex SDK

Use the SDK for:

- the top-level ReplayX orchestrator
- diagnosis arena workers
- challenger worker
- fix arena workers
- review worker
- skill writer and postmortem writer

Why:

- direct fit for long-horizon coding work
- built for coding agents
- thread/session model is enough for isolated worker phases

#### Codex CLI

Use the CLI for:

- `codex exec`-based reproducible runs
- CI automation
- auto-fix workflows
- scripted review passes
- local prompt iteration during development

Why:

- OpenAI’s cookbook explicitly shows Codex CLI in CI for automated fix proposals
- it is the cleanest way to operationalize ReplayX outside the product loop

#### AGENTS.md

Use `AGENTS.md` for:

- repo-wide invariant rules
- constraints
- verification expectations
- prompt style rules

Why:

- Codex reads `AGENTS.md` before working
- official guidance explicitly documents instruction discovery and layering

## ReplayX Phase Mapping

### Old plan to new plan

| Old direction | New direction |
| --- | --- |
| Skill loader via agent framework | ReplayX-owned fast-path matcher before any worker launch |
| ShadowWeaver agent | Repro phase worker under Codex SDK or scripted Codex CLI |
| 12 sandbox agents | Bounded diagnosis arena workers using Codex SDK |
| RedTeam agent | Challenger validation worker using Codex SDK |
| FixArena with some Codex pieces | Keep FixArena, but make it fully Codex-first |
| SkillWriter YAML from agent framework | Codex worker writes skill artifact with ReplayX schema |

## Proposed ReplayX vNext Pipeline

### Phase 0: Incident Intake

Normalize the incident bundle into a strict ReplayX input contract:

- incident id
- service
- environment
- severity
- symptoms
- stack traces
- logs
- metrics snapshots
- recent commits / diff summary
- known failing command
- known healthy command

Deliverable:

- `normalized_incident.json`

### Phase 1: Fast-Path Skill Match

Before spending tokens on a full arena:

- match error signatures
- match stack symbols
- match service + route + failure type
- score against existing ReplayX skills

If the confidence is high, run a single targeted fix flow. Otherwise continue.

### Phase 2: Repro and Environment Verification

One bounded worker:

- checks repro environment
- validates the incident still reproduces
- writes the minimal repro command
- identifies the tight failure surface

This phase should narrow the search space before diagnosis workers fan out.

### Phase 3: Diagnosis Arena

Run parallel diagnosis workers, but keep them bounded and specialized.

Recommended specializations:

1. concurrency and race conditions
2. auth and session failures
3. null, schema, and data-shape failures
4. deployment and config drift
5. upstream or dependency failure
6. performance or resource regression
7. database semantics and transaction bugs
8. cache or queue semantics

For the hackathon demo, start with 4 to 8 strong workers. Only increase worker count if you have evidence it improves quality on seeded incidents.

Each worker must output:

- diagnosis statement
- confidence
- evidence
- exact repro or falsification command
- candidate files
- why this is not a neighboring failure mode

### Phase 4: Challenger Validation

Take the top diagnosis candidates and try to disprove them.

The challenger must:

- search for alternative explanations
- run counter-checks
- reject weak diagnoses
- return one winning diagnosis or a ranked shortlist if uncertainty remains

### Phase 5: Fix Arena

Run three fix workers in parallel:

- minimal fix
- safest fix
- durable fix

Each fix worker must:

- patch only the permitted files
- run required verification
- produce a rollback note
- state blast radius

### Phase 6: Review and Regression Proof

One review worker validates the winning patch:

- reads the diff
- looks for regressions
- checks missing tests
- checks scope creep
- ensures verification actually proves the incident is addressed

### Phase 7: Postmortem and Skill Writer

Generate:

- human-readable postmortem
- reusable ReplayX skill
- prompt artifacts if the incident class should become a reusable arena pattern

## Suggested Technical Shape

### Orchestrator

Use a single Node entrypoint:

`orchestrator/main.ts`

Responsibilities:

- normalize incident bundle
- launch and track worker runs
- collect JSON outputs
- score outputs
- write artifacts

### Output contracts

Prefer strict machine-readable contracts for every phase.

Recommended formats:

- JSON for all phase outputs
- Markdown for final human deliverables
- YAML or JSON for reusable skills

### State management

ReplayX does not need a heavyweight agent state framework at the center.

Use ReplayX-owned state:

- incident bundle on disk
- per-phase JSON outputs on disk
- repo diff artifacts
- verification logs

That keeps the workflow inspectable and easy to replay.

## Model Guidance

### Recommended default

Use the strongest currently available coding model in the Codex family that fits latency and cost.

As of April 16, 2026, OpenAI’s model catalog lists these coding models:

- `GPT-5-Codex`
- `GPT-5.3-Codex`
- `GPT-5.2-Codex`

For ReplayX:

- default to `GPT-5.3-Codex` for the main coding workers if available in your environment
- use `GPT-5-Codex` where Codex product surfaces select it directly
- step down to `GPT-5.2-Codex` only for cost or availability reasons

Reason:

- OpenAI currently describes `GPT-5.3-Codex` as the most capable agentic coding model to date
- ReplayX is exactly an agentic coding workload

### Non-coding side tasks

If a future subtask is mostly summarization, labeling, or low-risk formatting, you may use a cheaper general model. Do not use a weaker model for the core diagnosis, fix, or review path.

## Prompt and Context Engineering Rules For ReplayX

These rules should govern every ReplayX prompt.

### 1. Keep the stable rules short

Put only durable rules in the system layer:

- what the phase is for
- what the worker may and may not change
- required output schema
- stop condition

### 2. Put incident detail in the user layer

Do not bake dynamic incident facts into the system prompt.

Pass them as structured context:

- incident summary
- relevant logs
- stack trace excerpt
- target files
- commands
- acceptance criteria

### 3. Prefer concrete task contracts

Every worker prompt should specify:

- exact goal
- exact allowed scope
- exact files or search areas
- exact verification command
- exact output schema

### 4. Ask for evidence, not opinions

Require:

- commands run
- relevant outputs
- repro proof
- falsification proof

### 5. Avoid over-prompting Codex

Do not bloat prompts with:

- motivational framing
- redundant roleplay
- repeated “think carefully” instructions
- long style instructions unrelated to the phase

### 6. Version prompts

Keep prompts in versioned Markdown.

If prompt changes affect outcomes, log:

- prompt version
- model
- incident bundle
- result quality

### 7. Keep static prompt prefixes stable

For any future hosted Responses API path, place stable instructions and examples first and append variable incident data later.

This follows OpenAI prompt-caching guidance and helps reduce cost and latency when ReplayX runs many similar incident prompts.

## Concrete Build Recommendation

### Build order

1. finalize AGENTS.md
2. define ReplayX phase output schemas
3. implement incident intake and fast-path matcher
4. implement repro phase
5. implement diagnosis arena
6. implement challenger
7. implement fix arena
8. implement review phase
9. implement postmortem and skill writer
10. build eval bundles from seeded incidents

### What not to build first

Do not start with:

- a generalized multi-agent framework
- handoff abstractions
- tool registries copied from Agents SDK patterns
- tracing UX before the core fix loop works

Build the winning path first.

## References

Official OpenAI references used for this decision:

- Codex SDK docs: https://developers.openai.com/codex/sdk
- Codex CLI docs: https://developers.openai.com/codex/cli
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex best practices: https://developers.openai.com/codex/learn/best-practices
- Prompting guide: https://developers.openai.com/api/docs/guides/prompting
- Prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering
- OpenAI model catalog: https://developers.openai.com/api/docs/models/all
- GPT-5-Codex Prompting Guide: https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide
- Codex CLI in CI cookbook: https://developers.openai.com/cookbook/examples/codex/autofix-github-actions
