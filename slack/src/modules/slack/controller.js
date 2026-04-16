const { sendError } = require("./http-errors");

function createSlackController({ slackService, bugsChannelId }) {
  return {
    async handleEvents(req, res) {
      if (req.body.type === "url_verification") {
        return res.type("text/plain").send(req.body.challenge);
      }

      if (req.body.type !== "event_callback") {
        return res.status(200).json({ ok: true, ignored: true });
      }

      if (req.body.event?.type !== "app_mention") {
        return res.status(200).json({ ok: true, ignored: true });
      }

      try {
        const result = await slackService.handleAppMention(req.body.event);
        return res.status(200).json({ ok: true, result });
      } catch (error) {
        return sendError(res, error);
      }
    },

    async postMessage(req, res) {
      const { channel, text, threadTs } = req.body || {};
      const targetChannel = channel || bugsChannelId;

      if (!text || typeof text !== "string") {
        return res.status(400).json({ error: "text is required" });
      }

      try {
        const result = await slackService.postMessage({
          channel: targetChannel,
          text,
          threadTs,
        });

        return res.status(200).json({ ok: true, result });
      } catch (error) {
        return sendError(res, error);
      }
    },
  };
}

module.exports = {
  createSlackController,
};
