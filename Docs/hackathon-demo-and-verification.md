# Hackathon Demo Verification Notes

This file is now the short-form verification companion for the main runbook.

Use these as the canonical docs instead:

- [replayx-demo-runbook.md](./replayx-demo-runbook.md) for the full live demo sequence
- [replayx-2min-demo-script.md](./replayx-2min-demo-script.md) for the spoken 2-minute pitch

## What This File Is For

Use this file when you want a compact technical verification checklist before a demo or recruiter call.

## Quick Technical Verification

From repo root:

```bash
pnpm install
pnpm --dir dashboard install
npm --prefix slack install
pnpm --dir dashboard build
npm test --prefix slack
```

Then check the local live-run stack:

```bash
pnpm demo-app
pnpm --dir dashboard dev -- --port 3001
npm start --prefix slack
```

Manual live-run creation check:

```bash
curl -s -X POST http://localhost:3001/api/replayx/runs \
  -H "Content-Type: application/json" \
  -d '{"source":"manual","text":"checkout oversell bug from verification"}'
```

Expected:

- `ok: true`
- `runId` exists
- `livePath` exists
- the run progresses to `completed`
- the final skill path is present only after completion

## Optional Replay Fallback Verification

```bash
pnpm golden-run incidents/checkout-race-condition.json
```

Then open:

- `/replay/incident-checkout-race-001`

That route should load cleanly and show diagnosis, fix, proof, postmortem, and skill artifacts.
