const { createSlackController } = require("./controller");
const { createSlackApiRouter } = require("./routes/api");
const { createSlackEventsRouter } = require("./routes/events");
const { SlackClient } = require("./client");
const { createSlackService } = require("./service");

function createSlackModule({
  signingSecret = process.env.SLACK_SIGNING_SECRET,
  bugsChannelId = process.env.SLACK_BUGS_CHANNEL_ID,
  slackService,
  slackClient,
  now = Date.now,
} = {}) {
  const effectiveSlackClient =
    slackClient || new SlackClient({ botToken: process.env.SLACK_BOT_TOKEN });
  const effectiveSlackService =
    slackService ||
    createSlackService({
      slackClient: effectiveSlackClient,
      bugsChannelId,
    });
  const controller = createSlackController({
    slackService: effectiveSlackService,
    bugsChannelId,
  });

  return {
    eventsRouter: createSlackEventsRouter({
      controller,
      signingSecret,
      now,
    }),
    apiRouter: createSlackApiRouter({ controller }),
  };
}

module.exports = {
  createSlackModule,
};
