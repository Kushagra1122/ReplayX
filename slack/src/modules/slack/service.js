function stripMentionPrefix(text = "") {
  return text.replace(/^<@[^>]+>\s*/, "").trim();
}

function createSlackService({ slackClient, bugsChannelId, logger }) {
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
      const replyText = cleanedText
        ? `ReplayX received your bug report: ${cleanedText}`
        : "ReplayX received your message in #bugs.";
      const threadTs = event.thread_ts;

      logger.info("slack.app_mention.reply.attempt", {
        channel: event.channel,
        threadTs,
        cleanedText,
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

      return result;
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
  createSlackService,
};
