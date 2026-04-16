# ReplayX

ReplayX is a Codex-first incident response system for the Codex hackathon.

It is designed to turn an incident bundle into:

- a ranked diagnosis
- a validated fix
- a reviewed patch
- a regression proof
- a postmortem
- a reusable incident skill

## Judge Start Here

ReplayX should be understood as:

- `demo_app/` is the broken target system
- Slack is the intake trigger for the bug report
- ReplayX is the incident-response product
- the ReplayX dashboard is the main demo surface
- Codex is the reasoning and coding engine behind the worker phases

The golden hackathon flow is:

1. show the bug in the demo app
2. report it through Slack
3. hand off into ReplayX
4. show diagnosis worker fan-out
5. show the chosen fix and proof
6. end on postmortem / reusable incident knowledge

For the 2-minute video, optimize for one strong incident and one clear transformation, not broad feature coverage.

## Canonical Docs

- `AGENTS.md`: durable repo instructions and working rules
- `PROMPTS.md`: stable root-level prompts, including Prompt 00
- `PIPELINE.md`: canonical workflow phases and execution contract
- `Docs/replayx-codex-first-architecture.md`: architecture decision and build direction
- `Docs/replayx-codex-first-prompts.md`: full internal ReplayX prompt pack
- `Docs/replayx-build-with-codex-usage-prompts.md`: phased operator prompts for using Codex to build ReplayX

## Current Repo Status

This repository now contains the hackathon scaffold plus a replayable golden-path demo flow:

- `orchestrator/`: TypeScript-first orchestration with implemented repro, diagnosis, challenger, fix, review, and artifact phases for the golden run
- `incidents/`: reserved for seeded incident bundles
- `skills/`: skill artifacts emitted from the golden run
- `demo_app/`: the seeded broken target system ReplayX diagnoses and fixes
- `dashboard/`: a Next.js replay-first judge-facing dashboard
- `slack/`: the Slack intake and handoff service

The repo is still demo-first rather than production-complete. The golden path is artifact-driven and replay-safe so the 2-minute demo does not depend on a fragile fully live run.

The important boundary is:

- the backend exists to generate and persist the golden run artifacts
- the dashboard exists to turn those artifacts into the main ReplayX product surface
- Slack exists as the intake trigger into the replay flow
- replay reliability matters more than broad live orchestration during the demo

## Scaffold Layout

- `orchestrator/main.ts`: Node entrypoint that can run repro, diagnosis, challenger, fix, review, and the golden artifact flow
- `orchestrator/types.ts`: shared runtime and phase contracts
- `orchestrator/phases/`: implemented golden-path backend phases
- `package.json`: Node and TypeScript project definition with `@openai/codex-sdk` as the intended orchestration dependency
- `tsconfig.json`: strict TypeScript configuration for the orchestrator

## Core Architecture Decision

ReplayX should use:

- `@openai/codex-sdk` for primary orchestration
- Codex CLI for `codex exec`, local automation, and build workflows

ReplayX should not use the OpenAI Agents SDK as the core runtime.

## Start Here

1. Read `AGENTS.md`.
2. Read `Docs/replayx-codex-first-architecture.md`.
3. Run `pnpm install`.
4. Generate the golden run artifacts with `pnpm golden-run incidents/checkout-race-condition.json`.
5. Start the demo app with `pnpm demo-app`.
6. Start the dashboard with `pnpm dashboard:dev`.
7. Use Slack as the intake trigger and the dashboard as the main demo surface.
