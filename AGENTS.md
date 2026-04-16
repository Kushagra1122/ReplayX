# ReplayX — AGENTS.md

## What This Repo Is

ReplayX is a Codex-first incident response project for the Codex hackathon.

The target product turns an incident bundle into:

- a ranked diagnosis
- a validated fix
- a reviewed patch
- a regression proof
- a postmortem
- a reusable incident skill

## Current Repo State

This repository is currently documentation-first.

The canonical files right now are:

- `AGENTS.md`
- `README.md`
- `PIPELINE.md`
- `PROMPTS.md`
- `Docs/replayx-codex-first-architecture.md`
- `Docs/replayx-codex-first-prompts.md`
- `Docs/replayx-build-with-codex-usage-prompts.md`

Do not assume the future implementation files already exist.

## Architecture Rule

- ReplayX must be Codex-first.
- Use `@openai/codex-sdk` as the primary orchestration runtime.
- Use Codex CLI for `codex exec`, local automation, and repeatable operator workflows.
- Do not use OpenAI Agents SDK as the core runtime.
- If a future hosted path is needed, prefer the Responses API with ReplayX-owned orchestration rather than switching the whole architecture to Agents SDK.

## Build Priority

Optimize for a winning hackathon demo, not framework breadth.

That means:

- one clear end-to-end incident flow
- strong seeded incidents
- bounded diagnosis workers
- bounded fix workers
- visible verification and artifacts
- a simple dashboard or replay mode that judges can understand quickly

## Prompting Rules

- Keep stable operating rules in `AGENTS.md` and `PROMPTS.md`.
- Keep the full worker prompt pack in `Docs/replayx-codex-first-prompts.md`.
- Keep build/operator prompts in `Docs/replayx-build-with-codex-usage-prompts.md`.
- Put dynamic incident detail in the user layer, not the system layer.
- Prefer explicit output schemas and verification commands.
- Keep prompts short, operational, and machine-checkable.

## Working Rules

- Read the relevant repo files before editing.
- Keep changes hackathon-scoped.
- Do not reintroduce old agent-framework abstractions.
- Run the narrowest useful verification after each batch.
- Keep docs aligned with the actual state of the repo.
- If Prompt 00 changes, keep `PROMPTS.md` and `Docs/replayx-codex-first-prompts.md` aligned.

## Done Means

A task is complete only when:

1. the requested docs or code exist
2. the relevant prompts or architecture are internally consistent
3. verification was run when possible, or the limitation is stated clearly
4. no stale Agents-SDK-based guidance remains as the recommended path

## Source Links

- Codex SDK: https://developers.openai.com/codex/sdk
- Codex CLI: https://developers.openai.com/codex/cli
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex best practices: https://developers.openai.com/codex/learn/best-practices
- Prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering
- Prompt caching guide: https://developers.openai.com/api/docs/guides/prompt-caching
