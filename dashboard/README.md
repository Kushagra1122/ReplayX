# ReplayX Dashboard

Judge-facing Next.js replay UI for ReplayX.

This app is intentionally replay-first:

- it reads saved artifacts from `../artifacts`
- it reads seeded incident metadata from `../incidents`
- it does not depend on live backend calls
- it defaults to the golden incident replay flow

Primary route:

- `/` shows the golden incident overview
- `/incidents/[incidentId]` shows a full replay page
