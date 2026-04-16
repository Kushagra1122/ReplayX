# ReplayX Hackathon Demo + Backend Verification Runbook

This is the fastest reliable path for your demo flow:

`faulty demo app -> bug reported in Slack -> orchestrator run starts -> dashboard shows live phase updates -> skill card visible`

## 1) One-Time Setup

From repo root:

```bash
cd /Users/sourabhkapure/Desktop/ReplayX
pnpm install
pnpm --dir dashboard install
npm --prefix slack install
```

Create Slack env:

```bash
cp slack/.env.example slack/.env
```

Edit `slack/.env` with real values:

- `SLACK_SIGNING_SECRET`
- `SLACK_BOT_TOKEN`
- `SLACK_BUGS_CHANNEL_ID`
- `REPLAYX_INTERNAL_API_TOKEN` (set any shared token string)

Use these local URLs to avoid port collisions:

- `REPLAYX_DASHBOARD_URL=http://localhost:3001`
- `REPLAYX_ORCHESTRATOR_URL=http://localhost:3001`

## 2) Start Services (4 terminals)

Terminal A: Demo app (faulty app)

```bash
cd /Users/sourabhkapure/Desktop/ReplayX
pnpm demo-app
```

Expected: `ReplayX demo app listening on http://127.0.0.1:4311`

Terminal B: Dashboard (includes live run backend routes)

```bash
cd /Users/sourabhkapure/Desktop/ReplayX
pnpm --dir dashboard dev -- --port 3001
```

Terminal C: Slack service

```bash
cd /Users/sourabhkapure/Desktop/ReplayX
npm --prefix slack start
```

Terminal D: (optional) webhook tunnel for local Slack callback

```bash
ngrok http 3000
```

If using ngrok, set your Slack Event Subscriptions URL to:

`https://<ngrok-id>.ngrok-free.app/slack/events`

## 3) Quick Backend Verification (before live demo)

Run these once from repo root:

```bash
pnpm --dir slack test
```

Expected: Slack tests pass.

Check dashboard run API health by creating a run manually:

```bash
curl -X POST http://localhost:3001/api/replayx/runs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <REPLAYX_INTERNAL_API_TOKEN>" \
  -d '{"source":"manual","text":"checkout race condition from manual backend check"}'
```

Expected response contains:

- `"ok": true`
- `"runId": "run_..."`
- `"livePath": "/live/run_..."`

Then check run status:

```bash
curl http://localhost:3001/api/replayx/runs/<runId>
```

Expected progression:

- `queued` -> `running` -> `completed`
- all phases eventually `completed`

## 4) Demo Execution Script (Live)

### Step 1: Show faulty app

Open:

- `http://127.0.0.1:4311/api/repro/checkout-race?mode=concurrent`
- `http://127.0.0.1:4311/api/repro/checkout-race?mode=serial`

Narration: concurrent path shows bug behavior vs serial control.

### Step 2: Report bug in Slack

In your configured bugs channel, mention the bot and paste bug text, for example:

`@ReplayX concurrent checkout oversells inventory; serial mode is fine`

### Step 3: Open live dashboard link from Slack reply

Slack reply should include:

- `ReplayX started live orchestration run run_xxx`
- `Dashboard handoff: http://localhost:3001/live/run_xxx`

Open the link.

### Step 4: Show realtime phase updates

On live page:

- status moves through incident intake -> diagnosis -> challenger -> fix -> review -> postmortem
- worker cards appear
- winning diagnosis appears
- fix strategy appears
- skill card appears

Note: current implementation is polling-based (near realtime), not websocket.

## 5) Must-Check Endpoints During Demo

Dashboard backend endpoints:

- `POST /api/replayx/runs`
- `GET /api/replayx/runs/<runId>`

Slack endpoint:

- `POST /slack/events`

Demo app endpoint:

- `GET /api/repro/checkout-race?mode=concurrent`

## 6) Fast Troubleshooting

If Slack reply does not include `/live/run_...` link:

1. Check `REPLAYX_ORCHESTRATOR_URL` in `slack/.env` is `http://localhost:3001`
2. Check dashboard is running on port `3001`
3. Check token matches between `slack/.env` and dashboard API header usage

If Slack events are not reaching local service:

1. Verify tunnel is running to port `3000`
2. Verify Slack Event Subscriptions URL points to `<tunnel>/slack/events`
3. Verify `SLACK_SIGNING_SECRET`

If run stays in `queued`:

1. Check dashboard terminal logs for pipeline errors
2. Validate incident files exist in `incidents/`

## 7) Final 30-Minute Operator Order

1. Start demo app.
2. Start dashboard on `3001`.
3. Start Slack service on `3000`.
4. Verify one manual `POST /api/replayx/runs`.
5. Trigger Slack bug report.
6. Open live run URL from Slack.
7. End on winning diagnosis + fix + skill card.
