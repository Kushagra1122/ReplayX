# ReplayX

ReplayX is a Codex-first incident response system built for the Codex hackathon.

Demo video: https://youtu.be/ko7e5ZREehE

It turns a production-style incident into:

- a ranked diagnosis
- a reviewed fix strategy
- a regression verification plan
- a postmortem
- a reusable incident skill

The core idea is simple: incident response should feel less like panic and more like playback.

## Submission Links

- Demo video: https://youtu.be/ko7e5ZREehE

## What Makes ReplayX Different

Most incident tooling helps teams route alerts, view logs, or chat around a problem. ReplayX is aimed at the harder step after that: converting messy evidence into an engineering-quality debugging flow.

ReplayX uses Codex as the reasoning and coding engine behind bounded specialists that:

- inspect incident evidence
- narrow the failure surface
- compare competing root-cause hypotheses
- challenge weak diagnoses
- rank fix strategies
- emit reusable incident knowledge

This is not a generic chatbot wrapped in an ops UI. It is a code-aware incident workflow designed around debugging, verification, and reuse.

## Demo Flow

The golden demo path is:

1. A real bug appears in the seeded `demo_app/`.
2. A user reports it in Slack.
3. ReplayX starts an incident run.
4. The dashboard shows diagnosis worker fan-out and the winning root cause.
5. ReplayX presents the safest fix path and the proof required to trust it.
6. The run ends with a postmortem and a reusable incident skill.

For hackathon judging, the main product surface is the dashboard, not the broken app or Slack bot in isolation.

## Why Codex Is Essential

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

## Run The Demo

### 1. Install dependencies

```bash
pnpm install
pnpm --dir dashboard install
npm --prefix slack install
```

### 2. Generate golden run artifacts

```bash
pnpm golden-run incidents/checkout-race-condition.json
```

### 3. Start the broken app

```bash
pnpm demo-app
```

### 4. Start the dashboard

```bash
pnpm --dir dashboard dev -- --port 3001
```

### 5. Optional: start Slack intake

```bash
npm --prefix slack start
```

### 6. Open the dashboard

- overview: `http://localhost:3001/`
- golden replay: `http://localhost:3001/replay/incident-checkout-race-001`

For the live demo runbook, see [Docs/hackathon-demo-and-verification.md](Docs/hackathon-demo-and-verification.md).

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
- The dashboard is currently polling-based for live runs rather than websocket-based.

These are acceptable tradeoffs for the current hackathon scope and demo constraints.

## References

- Codex SDK: https://developers.openai.com/codex/sdk
- Codex CLI: https://developers.openai.com/codex/cli
- AGENTS.md guide: https://developers.openai.com/codex/guides/agents-md
- Codex best practices: https://developers.openai.com/codex/learn/best-practices
- Prompt engineering guide: https://developers.openai.com/api/docs/guides/prompt-engineering
