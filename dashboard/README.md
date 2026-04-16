# ReplayX Dashboard

Judge-facing Next.js replay UI for ReplayX.

This app is intentionally replay-first:

- it reads saved artifacts from the repo-level `artifacts/` directory at runtime
- it reads seeded incident metadata from the repo-level `incidents/` directory at runtime
- it does not depend on live backend calls
- it defaults to the golden incident replay flow

Primary route:

- `/` shows the golden incident overview
- `/incidents/[incidentId]` shows a full replay page
- `/replay/[incidentId]` aliases the same full replay page for Slack/demo handoff

## Demo usage

```bash
cd dashboard
pnpm install
pnpm dev
```

Open the golden replay after generating artifacts:

- `/replay/incident-checkout-race-001`
