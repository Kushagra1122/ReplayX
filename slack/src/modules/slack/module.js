const { createSlackController } = require("./controller");
const { createSlackApiRouter } = require("./routes/api");
const { createSlackEventsRouter } = require("./routes/events");
const { SlackClient } = require("./client");
const { createLogger } = require("./logger");
const { createSlackService } = require("./service");

function createSlackModule({
  signingSecret = process.env.SLACK_SIGNING_SECRET,
  bugsChannelId = process.env.SLACK_BUGS_CHANNEL_ID,
  slackService,
  slackClient,
  logger,
  now = Date.now,
} = {}) {
  const effectiveLogger = createLogger(logger);
  const effectiveSlackClient =
    slackClient || new SlackClient({ botToken: process.env.SLACK_BOT_TOKEN });
  const effectiveSlackService =
    slackService ||
    createSlackService({
      slackClient: effectiveSlackClient,
      bugsChannelId,
      logger: effectiveLogger,
    });
  const controller = createSlackController({
    slackService: effectiveSlackService,
    bugsChannelId,
    logger: effectiveLogger,
  });

  return {
    eventsRouter: createSlackEventsRouter({
      controller,
      logger: effectiveLogger,
      signingSecret,
      now,
    }),
    apiRouter: createSlackApiRouter({ controller }),
  };
}

module.exports = {
  createSlackModule,
};
