# ReplayX

ReplayX is a Codex-first incident response system for the Codex hackathon.

It is designed to turn an incident bundle into:

- a ranked diagnosis
- a validated fix
- a reviewed patch
- a regression proof
- a postmortem
- a reusable incident skill

## Canonical Docs

- `AGENTS.md`: durable repo instructions and working rules
- `PROMPTS.md`: stable root-level prompts, including Prompt 00
- `PIPELINE.md`: canonical workflow phases and execution contract
- `Docs/replayx-codex-first-architecture.md`: architecture decision and build direction
- `Docs/replayx-codex-first-prompts.md`: full internal ReplayX prompt pack
- `Docs/replayx-build-with-codex-usage-prompts.md`: phased operator prompts for using Codex to build ReplayX

## Current Repo Status

This repository now contains the initial ReplayX hackathon scaffold plus the first real Codex-backed worker phases:

- `orchestrator/`: TypeScript-first orchestrator entrypoint, run-plan types, and the implemented repro and diagnosis phases
- `incidents/`: reserved for seeded incident bundles
- `skills/`: reserved for reusable ReplayX skill artifacts
- `demo_app/`: reserved for the small seeded app ReplayX will debug
- `dashboard/`: reserved for the replayable hackathon dashboard

The repo is still intentionally early. The scaffold is in place, the repro phase is implemented, and the diagnosis arena now runs bounded worker fan-out. Later phases such as challenger, fix arena, review, and postmortem remain placeholders.

The important boundary is:

- phases 1 to 3.5 are scaffold, incident, demo-app, and the first implemented worker orchestration
- actual Codex SDK orchestration is now present in repro and diagnosis; challenger and fix workers are the next major implementation steps

## Scaffold Layout

- `orchestrator/main.ts`: Node entrypoint that builds the current ReplayX run plan
- `orchestrator/types.ts`: shared runtime and phase contracts
- `orchestrator/phases/`: implemented repro and diagnosis modules plus placeholder modules for later phases
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
4. Use `Docs/replayx-build-with-codex-usage-prompts.md` phase by phase to build the project.
5. Use `PROMPTS.md` and `Docs/replayx-codex-first-prompts.md` as the internal prompt source for ReplayX once implementation starts.
