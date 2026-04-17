# ReplayX

ReplayX is a Codex-first incident response system built for the Codex hackathon.

It turns a production-style incident into:

- a ranked diagnosis
- a reviewed fix strategy
- a regression verification plan
- a postmortem
- a reusable incident skill

The core product idea is simple: incident response should feel less like panic and more like playback.

## What ReplayX Is

ReplayX is not a generic chatbot wrapped around logs.

It is a code-aware incident workflow where Codex-powered specialists:

- inspect incident evidence
- narrow the failure surface
- compare competing root-cause hypotheses
- challenge weak diagnoses
- rank fix strategies
- emit reusable incident knowledge

The main product surface is the dashboard. Slack is the intake trigger. The seeded `demo_app/` exists to make the failure concrete and demoable.

## Current Product Modes

ReplayX supports two product modes:

1. **Live run**
   - a user reports a bug in Slack
   - ReplayX starts a live incident run
   - the dashboard updates live over WebSockets as the orchestrator advances
   - the run ends with a postmortem and reusable skill

2. **Replay**
   - precomputed artifacts drive a stable fallback path at `/replay/incident-checkout-race-001`
   - use this when you want a safety net or a no-risk demo

For recruiter and judge demos, the recommended primary path is the **live run**.

## Why Codex Matters

ReplayX only works if the system behind it can do software-engineering work, not just summarize text.

The hard parts of incident response are:

- reading real repository context
- understanding code and failure evidence together
- proposing targeted fixes instead of vague advice
- producing concrete verification steps
- preserving reusable knowledge for the next incident

ReplayX is built around `@openai/codex-sdk` and Codex-style repo-aware execution because those tasks are fundamentally coding-agent tasks.

## Current Project State

This repository contains a replay-safe, judge-friendly end-to-end implementation:

- `demo_app/`: seeded broken application with reproducible incidents
- `incidents/`: realistic incident bundles for the golden path
- `orchestrator/`: TypeScript orchestration phases for intake, skill match, repro, diagnosis, challenger, fix, review, and artifact writing
- `dashboard/`: Next.js dashboard for replay and live run visualization
- `slack/`: Slack intake and handoff service
- `skills/`: reusable skill artifacts emitted from the golden run

Important implementation boundary:

- ReplayX already runs the golden path end to end
- Slack can trigger a live run and hand off directly into the dashboard
- the live dashboard now uses WebSockets for real-time orchestration updates, with SSE fallback retained for resilience
- the flow is artifact-driven and replay-safe for demo reliability
- later phases currently emit reviewed fix proposals and verification plans rather than automatically patching and validating a target repository

That tradeoff is intentional. For a 2-minute hackathon demo, reliability and clarity beat fragile live patch execution.

## What ReplayX Produces

For each incident run, ReplayX aims to preserve inspectable artifacts instead of hiding its reasoning in one opaque agent trace.

Outputs include:

- normalized incident bundle
- per-phase JSON outputs
- diagnosis rankings
- challenger verdict
- fix strategy recommendation
- verification plan
- postmortem
- reusable skill artifact

This makes the run replayable, auditable, and useful after the incident ends.

## Architecture

ReplayX follows a bounded phase model:

1. Incident intake
2. Fast-path skill match
3. Repro and environment verification
4. Diagnosis arena
5. Challenger validation
6. Fix arena
7. Review and regression plan
8. Postmortem and skill writing

This structure is deliberate. It gives the system stronger failure isolation, clearer artifacts, and a much better judge story than one unstructured agent run.

More detail:

- [PIPELINE.md](PIPELINE.md)
- [Docs/replayx-architecture-diagram.md](Docs/replayx-architecture-diagram.md)
- [Docs/replayx-codex-first-architecture.md](Docs/replayx-codex-first-architecture.md)
- [Docs/replayx-codex-first-prompts.md](Docs/replayx-codex-first-prompts.md)

## Documentation Guide

Use these files as the canonical entry points:

- Product and repo overview: [README.md](README.md)
- Live demo operations: [Docs/replayx-demo-runbook.md](Docs/replayx-demo-runbook.md)
- 2-minute pitch script: [Docs/replayx-2min-demo-script.md](Docs/replayx-2min-demo-script.md)
- Docs directory map: [Docs/README.md](Docs/README.md)
- Submission framing: [Docs/replayx-hackathon-submission.md](Docs/replayx-hackathon-submission.md)

## Run The Demo

### 1. Install dependencies

```bash
pnpm install
pnpm --dir dashboard install
npm --prefix slack install
```

### 2. Start the broken app

```bash
pnpm demo-app
```

Expected demo app URL:

- `http://127.0.0.1:4311/`

### 3. Start the dashboard

```bash
pnpm --dir dashboard dev -- --port 3001
```

### 4. Start Slack intake

```bash
npm --prefix slack start
```

Expected Slack service URL:

- `http://localhost:3000/`

### 5. Open the dashboard

- overview: `http://localhost:3001/`
- live run: created from Slack or via `POST /api/replayx/runs`, then opened at `/live/<runId>`

### Optional backup: precompute replay artifacts

If you want the replay fallback route available:

```bash
pnpm golden-run incidents/checkout-race-condition.json
```

Then open:

- golden replay: `http://localhost:3001/replay/incident-checkout-race-001`

For the full recruiter/judge live flow, see [Docs/replayx-demo-runbook.md](Docs/replayx-demo-runbook.md).

## Project Structure

```text
ReplayX/
├── dashboard/      # Judge-facing Next.js UI
├── demo_app/       # Seeded broken target app
├── incidents/      # Incident fixtures used for replay
├── orchestrator/   # Codex-first orchestration phases
├── skills/         # Reusable incident skills
├── slack/          # Slack intake and handoff service
├── AGENTS.md
├── PIPELINE.md
└── PROMPTS.md
```

## Why This Is A Strong Hackathon Project

ReplayX is ambitious in the right way:

- it uses Codex for the part humans actually struggle with during incidents: debugging and fix reasoning
- it turns agent output into durable engineering artifacts instead of one-off chat
- it is easy to understand in a short demo
- it is technically grounded in a real repo workflow
- it creates a reusable memory loop through incident skills

The project is not trying to show "AI can read logs." It is showing a credible new operating model for software incidents.

## Known Limits

- The current golden path optimizes for replay reliability over full live patch execution.
- Slack is the intake trigger, not the main product surface.
- Live runs now use WebSockets for dashboard updates, with SSE and polling retained as fallback paths.
- The orchestrator still publishes progress by updating persisted run-state files, and the dashboard server pushes those updates over the socket connection.
- The fix path is still a reviewed proposal plus proof plan, not an automatic repo patch-and-validate loop.

These are acceptable tradeoffs for the current hackathon scope and demo constraints.

## References

- Codex SDK: https://developers.openai.com/codex/sdk
- Codex CLI: https://developers.openai.com/codex/cli
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex best practices: https://developers.openai.com/codex/learn/best-practices
- Prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering
