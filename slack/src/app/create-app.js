const express = require("express");

const {
  createHealthRouter,
} = require("../modules/health/routes/health-routes");
const { createSlackModule } = require("../modules/slack/module");

function createApp({
  signingSecret = process.env.SLACK_SIGNING_SECRET,
  bugsChannelId = process.env.SLACK_BUGS_CHANNEL_ID,
  dashboardBaseUrl = process.env.REPLAYX_DASHBOARD_URL,
  goldenIncidentId = process.env.REPLAYX_GOLDEN_INCIDENT_ID,
  slackService,
  slackClient,
  logger,
  now = Date.now,
} = {}) {
  const app = express();
  const slackModule = createSlackModule({
    signingSecret,
    bugsChannelId,
    dashboardBaseUrl,
    goldenIncidentId,
    slackService,
    slackClient,
    logger,
    now,
  });

  app.use(createHealthRouter());
  app.use("/slack", slackModule.eventsRouter);
  app.use("/api/slack", slackModule.apiRouter);

  return app;
}

module.exports = {
  createApp,
};
