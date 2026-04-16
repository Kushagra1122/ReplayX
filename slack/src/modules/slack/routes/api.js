const express = require("express");

function createSlackApiRouter({ controller }) {
  const router = express.Router();

  router.post("/post-message", express.json(), controller.postMessage);

  return router;
}

module.exports = {
  createSlackApiRouter,
};
