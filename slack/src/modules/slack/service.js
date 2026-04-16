function stripMentionPrefix(text = "") {
  return text.replace(/^<@[^>]+>\s*/, "").trim();
}

function createSlackService({ slackClient, bugsChannelId }) {
  return {
    async handleAppMention(event) {
      if (bugsChannelId && event.channel !== bugsChannelId) {
        return { ignored: true, reason: "channel_not_enabled" };
      }

      const cleanedText = stripMentionPrefix(event.text);
      const replyText = cleanedText
        ? `ReplayX received your bug report: ${cleanedText}`
        : "ReplayX received your message in #bugs.";

      return slackClient.postMessage({
        channel: event.channel,
        text: replyText,
        threadTs: event.thread_ts,
      });
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
