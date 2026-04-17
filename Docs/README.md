# ReplayX Docs Map

This directory holds the long-form product, architecture, and operator reference material for ReplayX.

If you are new to the repo, read in this order:

1. [README.md](../README.md)
   The product overview, repo status, quickstart, and top-level navigation.
2. [replayx-demo-runbook.md](./replayx-demo-runbook.md)
   The live recruiter/judge demo path and operational checklist.
3. [replayx-2min-demo-script.md](./replayx-2min-demo-script.md)
   The spoken 2-minute pitch script and recording guidance.
4. [PIPELINE.md](../PIPELINE.md)
   The canonical phase model and execution contract.

## Architecture

- [replayx-codex-first-architecture.md](./replayx-codex-first-architecture.md)
  The main architecture decision record for the Codex-first design.
- [replayx-architecture-diagram.md](./replayx-architecture-diagram.md)
  The judge-friendly system and product diagrams.

## Prompting

- [PROMPTS.md](../PROMPTS.md)
  Root-level prompt catalog for stable prompt ownership.
- [replayx-codex-first-prompts.md](./replayx-codex-first-prompts.md)
  Extended prompt pack and worker prompt reference.
- [replayx-build-with-codex-usage-prompts.md](./replayx-build-with-codex-usage-prompts.md)
  Operator-facing prompts used while building ReplayX itself.

## Demo / Submission

- [demo-script.md](./demo-script.md)
  Short canonical summary of the current demo beats.
- [hackathon-demo-and-verification.md](./hackathon-demo-and-verification.md)
  Supplemental verification notes and operator checklist.
- [replayx-hackathon-submission.md](./replayx-hackathon-submission.md)
  Submission-pack positioning and public-facing pitch text.

## Product Surface Docs

- [dashboard/README.md](../dashboard/README.md)
  Dashboard routes, custom server usage, and live/replay modes.
- [slack/README.md](../slack/README.md)
  Slack intake wiring and environment variables.
- [demo_app/README.md](../demo_app/README.md)
  Seeded broken app and repro endpoints.
- [incidents/README.md](../incidents/README.md)
  Incident fixtures and their purpose.
- [skills/README.md](../skills/README.md)
  Reusable skill artifacts.

## Current Canonical Rule

When multiple docs touch the same topic, treat these as the source of truth:

- Product / onboarding: [README.md](../README.md)
- Demo operations: [replayx-demo-runbook.md](./replayx-demo-runbook.md)
- Spoken pitch: [replayx-2min-demo-script.md](./replayx-2min-demo-script.md)
- Phase model: [PIPELINE.md](../PIPELINE.md)
- Architecture decision: [replayx-codex-first-architecture.md](./replayx-codex-first-architecture.md)
