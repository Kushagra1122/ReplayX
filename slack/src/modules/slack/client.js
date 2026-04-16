class SlackApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "SlackApiError";
    this.details = details;
  }
}

class SlackClient {
  constructor({ botToken, fetchImpl = fetch }) {
    this.botToken = botToken;
    this.fetchImpl = fetchImpl;
  }

  async postMessage({ channel, text, threadTs }) {
    if (!this.botToken) {
      throw new SlackApiError("Missing SLACK_BOT_TOKEN");
    }

    const payload = { channel, text };

    if (threadTs) {
      payload.thread_ts = threadTs;
    }

    const response = await this.fetchImpl("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.botToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new SlackApiError("Slack chat.postMessage failed", {
        status: response.status,
        slackError: result.error,
      });
    }

    return result;
  }
}

module.exports = {
  SlackApiError,
  SlackClient,
};
