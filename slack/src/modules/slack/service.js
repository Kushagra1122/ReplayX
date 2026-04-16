function stripMentionPrefix(text = "") {
  return text.replace(/^<@[^>]+>\s*/, "").trim();
}

const DEFAULT_GOLDEN_INCIDENT_ID = "incident-checkout-race-001";

function normalizeBaseUrl(url) {
  return typeof url === "string" ? url.trim().replace(/\/+$/, "") : "";
}

function buildReplayPath(goldenIncidentId) {
  return `/replay/${encodeURIComponent(goldenIncidentId)}`;
}

function buildHandoffTarget({ dashboardBaseUrl, goldenIncidentId }) {
  const replayPath = buildReplayPath(goldenIncidentId);
  const normalizedBaseUrl = normalizeBaseUrl(dashboardBaseUrl);

  return normalizedBaseUrl ? `${normalizedBaseUrl}${replayPath}` : replayPath;
}

function buildAppMentionReply({ cleanedText, goldenIncidentId, handoffTarget }) {
  const bugSummary = cleanedText || "No bug details were included.";

  return [
    `ReplayX logged this bug report: ${bugSummary}`,
    `Next: routing it into the ReplayX incident flow for \`${goldenIncidentId}\`.`,
    `Dashboard handoff: ${handoffTarget}`,
  ].join("\n");
}

function createSlackService({
  slackClient,
  bugsChannelId,
  dashboardBaseUrl,
  goldenIncidentId = DEFAULT_GOLDEN_INCIDENT_ID,
  logger,
}) {
  return {
    async handleAppMention(event) {
      if (bugsChannelId && event.channel !== bugsChannelId) {
        logger.info("slack.app_mention.ignored", {
          channel: event.channel,
          expectedChannel: bugsChannelId,
          reason: "channel_not_enabled",
        });
        return { ignored: true, reason: "channel_not_enabled" };
      }

      const cleanedText = stripMentionPrefix(event.text);
      const handoffTarget = buildHandoffTarget({
        dashboardBaseUrl,
        goldenIncidentId,
      });
      const replyText = buildAppMentionReply({
        cleanedText,
        goldenIncidentId,
        handoffTarget,
      });
      const threadTs = event.thread_ts;

      logger.info("slack.app_mention.reply.attempt", {
        channel: event.channel,
        threadTs,
        cleanedText,
        goldenIncidentId,
        handoffTarget,
      });

      const result = await slackClient.postMessage({
        channel: event.channel,
        text: replyText,
        threadTs,
      });

      logger.info("slack.app_mention.reply.success", {
        channel: event.channel,
        threadTs,
        ts: result?.ts,
      });

      return {
        ...result,
        incidentId: goldenIncidentId,
        handoffTarget,
      };
    },

    async postMessage({ channel, text, threadTs }) {
      const targetChannel = channel || bugsChannelId;

      if (!targetChannel) {
        const error = new Error("A Slack channel is required.");
        error.statusCode = 400;
        throw error;
      }

      return slackClient.postMessage({
        channel: targetChannel,
        text,
        threadTs,
      });
    },
  };
}

module.exports = {
  DEFAULT_GOLDEN_INCIDENT_ID,
  buildAppMentionReply,
  buildHandoffTarget,
  createSlackService,
  buildReplayPath,
};
