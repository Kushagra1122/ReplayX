const express = require("express");

const {
  captureRawBody,
  createSlackSignatureMiddleware,
} = require("../middleware/signature");

function createSlackEventsRouter({ controller, signingSecret, now }) {
  const router = express.Router();

  router.post(
    "/events",
    express.json({ verify: captureRawBody }),
    createSlackSignatureMiddleware({ signingSecret, now }),
    controller.handleEvents,
  );

  return router;
}

module.exports = {
  createSlackEventsRouter,
};
