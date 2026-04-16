const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../src/app/create-app");
const { createSlackSignature } = require("../src/modules/slack/signature");

const signingSecret = "test-signing-secret";
const fixedTimestamp = 1_700_000_000;
const fixedNow = () => fixedTimestamp * 1000;

function signPayload(payload) {
  const rawBody = JSON.stringify(payload);
  const signature = createSlackSignature(
    signingSecret,
    String(fixedTimestamp),
    rawBody,
  );

  return {
    rawBody,
    signature,
  };
}

test("GET /health returns ok", async () => {
  const app = createApp({
    signingSecret,
    now: fixedNow,
    slackService: {
      handleAppMention: async () => ({}),
      postMessage: async () => ({}),
    },
  });

  const response = await request(app).get("/health");

  assert.equal(response.status, 200);
  assert.deepEqual(response.body, { ok: true });
});

test("POST /slack/events returns plaintext challenge for url_verification", async () => {
  const payload = {
    type: "url_verification",
    challenge: "challenge-token",
  };
  const { rawBody, signature } = signPayload(payload);

  const app = createApp({
    signingSecret,
    now: fixedNow,
    slackService: {
      handleAppMention: async () => ({}),
      postMessage: async () => ({}),
    },
  });

  const response = await request(app)
    .post("/slack/events")
    .set("Content-Type", "application/json")
    .set("X-Slack-Request-Timestamp", String(fixedTimestamp))
    .set("X-Slack-Signature", signature)
    .send(rawBody);

  assert.equal(response.status, 200);
  assert.equal(response.text, "challenge-token");
  assert.equal(response.headers["content-type"], "text/plain; charset=utf-8");
});

test("POST /slack/events rejects invalid signatures", async () => {
  const app = createApp({
    signingSecret,
    now: fixedNow,
    slackService: {
      handleAppMention: async () => ({}),
      postMessage: async () => ({}),
    },
  });

  const response = await request(app)
    .post("/slack/events")
    .set("Content-Type", "application/json")
    .set("X-Slack-Request-Timestamp", String(fixedTimestamp))
    .set("X-Slack-Signature", "v0=invalid")
    .send(JSON.stringify({ type: "url_verification", challenge: "nope" }));

  assert.equal(response.status, 401);
  assert.deepEqual(response.body, { error: "Invalid Slack signature" });
});

test("POST /slack/events replies to app mentions in the bugs channel", async () => {
  const calls = [];
  const app = createApp({
    signingSecret,
    bugsChannelId: "CBUGS123",
    now: fixedNow,
    slackClient: {
      postMessage: async (payload) => {
        calls.push(payload);
        return { posted: true };
      },
    },
  });

  const payload = {
    type: "event_callback",
    event: {
      type: "app_mention",
      channel: "CBUGS123",
      text: "<@UREPLAYX> app is broken",
      ts: "171234.123",
    },
  };
  const { rawBody, signature } = signPayload(payload);

  const response = await request(app)
    .post("/slack/events")
    .set("Content-Type", "application/json")
    .set("X-Slack-Request-Timestamp", String(fixedTimestamp))
    .set("X-Slack-Signature", signature)
    .send(rawBody);

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    channel: "CBUGS123",
    text: "ReplayX received your bug report: app is broken",
    threadTs: undefined,
  });
  assert.deepEqual(response.body, { ok: true, result: { posted: true } });
});

test("POST /slack/events replies in-thread when the mention came from a thread", async () => {
  const calls = [];
  const app = createApp({
    signingSecret,
    bugsChannelId: "CBUGS123",
    now: fixedNow,
    slackClient: {
      postMessage: async (payload) => {
        calls.push(payload);
        return { posted: true };
      },
    },
  });

  const payload = {
    type: "event_callback",
    event: {
      type: "app_mention",
      channel: "CBUGS123",
      text: "<@UREPLAYX> still broken in thread",
      ts: "171234.124",
      thread_ts: "171234.100",
    },
  };
  const { rawBody, signature } = signPayload(payload);

  const response = await request(app)
    .post("/slack/events")
    .set("Content-Type", "application/json")
    .set("X-Slack-Request-Timestamp", String(fixedTimestamp))
    .set("X-Slack-Signature", signature)
    .send(rawBody);

  assert.equal(response.status, 200);
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    channel: "CBUGS123",
    text: "ReplayX received your bug report: still broken in thread",
    threadTs: "171234.100",
  });
  assert.deepEqual(response.body, { ok: true, result: { posted: true } });
});

test("POST /api/slack/post-message posts to the default bugs channel", async () => {
  const calls = [];
  const app = createApp({
    signingSecret,
    bugsChannelId: "CBUGS123",
    now: fixedNow,
    slackService: {
      handleAppMention: async () => ({}),
      postMessage: async (payload) => {
        calls.push(payload);
        return { ok: true, channel: payload.channel, ts: "1.23" };
      },
    },
  });

  const response = await request(app)
    .post("/api/slack/post-message")
    .send({ text: "Investigating this now" });

  assert.equal(response.status, 200);
  assert.deepEqual(calls[0], {
    channel: "CBUGS123",
    text: "Investigating this now",
    threadTs: undefined,
  });
  assert.equal(response.body.ok, true);
});

test("POST /api/slack/post-message validates the text field", async () => {
  const app = createApp({
    signingSecret,
    now: fixedNow,
    slackService: {
      handleAppMention: async () => ({}),
      postMessage: async () => ({}),
    },
  });

  const response = await request(app)
    .post("/api/slack/post-message")
    .send({ channel: "CBUGS123" });

  assert.equal(response.status, 400);
  assert.deepEqual(response.body, { error: "text is required" });
});
