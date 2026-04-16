# Slack Integration

This folder contains the ReplayX Slack service as a self-contained package.

## Render deployment

The repo root now includes a `render.yaml` Blueprint that deploys this folder as a Render web service.

After the service is created in Render, set the Slack app Event Subscriptions request URL to:

- `https://<your-render-service>.onrender.com/slack/events`

Required environment variables in Render:

- `SLACK_SIGNING_SECRET`
- `SLACK_BOT_TOKEN`
- `SLACK_BUGS_CHANNEL_ID`

## Structure

- `src/index.js`: service entrypoint
- `src/app/create-app.js`: Express app assembly
- `src/modules/health/`: health endpoint controller and routes
- `src/modules/slack/client.js`: Slack Web API client
- `src/modules/slack/controller.js`: webhook and API handlers
- `src/modules/slack/http-errors.js`: Slack-aware HTTP error mapping
- `src/modules/slack/module.js`: Slack module composition entrypoint
- `src/modules/slack/service.js`: mention handling and message posting behavior
- `src/modules/slack/signature.js`: request signing helpers
- `src/modules/slack/middleware/signature.js`: Express middleware for Slack signature validation
- `src/modules/slack/routes/events.js`: `POST /slack/events`
- `src/modules/slack/routes/api.js`: `POST /api/slack/post-message`
- `test/app.test.js`: service tests
