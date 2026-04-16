const { verifySlackRequest } = require("../signature");

function captureRawBody(req, res, buffer) {
  req.rawBody = buffer.toString("utf8");
}

function createSlackSignatureMiddleware({ signingSecret, now }) {
  return (req, res, next) => {
    const signature = req.get("X-Slack-Signature");
    const timestamp = req.get("X-Slack-Request-Timestamp");
    const rawBody = req.rawBody || JSON.stringify(req.body || {});

    if (
      !verifySlackRequest({
        signingSecret,
        timestamp,
        signature,
        rawBody,
        now: now(),
      })
    ) {
      return res.status(401).json({ error: "Invalid Slack signature" });
    }

    return next();
  };
}

module.exports = {
  captureRawBody,
  createSlackSignatureMiddleware,
};
