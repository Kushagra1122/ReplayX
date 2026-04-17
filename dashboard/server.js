const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const next = require("next");
const { WebSocketServer } = require("ws");

const dev = process.env.NODE_ENV !== "production";
const args = process.argv.slice(2);
const readCliFlag = (flagName) => {
  const index = args.findIndex((arg) => arg === flagName);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
};

const hostname = readCliFlag("--hostname") || process.env.HOSTNAME || "0.0.0.0";
const port = Number.parseInt(readCliFlag("--port") || process.env.PORT || "3000", 10);
const app = next({ dev, dir: __dirname, hostname, port });
const handle = app.getRequestHandler();

const repoRoot = path.resolve(__dirname, "..");
const runStoreRoot = path.join(repoRoot, ".replayx-runs");
const wsRoutePattern = /^\/api\/replayx\/runs\/([^/]+)\/ws$/;

function readRunPayload(runId) {
  try {
    const text = fs.readFileSync(path.join(runStoreRoot, `${runId}.json`), "utf8");
    return JSON.stringify({ ok: true, run: JSON.parse(text) });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return JSON.stringify({ ok: false, error: "Run not found" });
    }

    return JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : "Unable to load run"
    });
  }
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => handle(req, res));
  const wss = new WebSocketServer({ noServer: true });
  const nextUpgradeHandler = app.getUpgradeHandler();

  wss.on("connection", (socket, request, runId) => {
    const runFilePath = path.join(runStoreRoot, `${runId}.json`);
    let closed = false;
    let closeTimer = null;

    const sendSnapshot = () => {
      if (closed || socket.readyState !== socket.OPEN) {
        return;
      }

      const payload = readRunPayload(runId);
      socket.send(payload);

      try {
        const parsed = JSON.parse(payload);
        if (parsed.ok && (parsed.run.status === "completed" || parsed.run.status === "failed")) {
          closeTimer = setTimeout(() => {
            if (!closed && socket.readyState === socket.OPEN) {
              socket.close();
            }
          }, 250);
        }
      } catch {
        // Ignore malformed payload parsing here; client will surface it.
      }
    };

    sendSnapshot();

    let watcher = null;

    try {
      fs.mkdirSync(runStoreRoot, { recursive: true });
      watcher = fs.watch(runStoreRoot, (_eventType, filename) => {
        if (!filename || filename !== `${runId}.json`) {
          return;
        }

        sendSnapshot();
      });
    } catch {
      const pollId = setInterval(sendSnapshot, 750);
      watcher = { close: () => clearInterval(pollId) };
    }

    const cleanup = () => {
      if (closed) {
        return;
      }

      closed = true;

      if (closeTimer) {
        clearTimeout(closeTimer);
      }

      watcher?.close?.();
    };

    socket.on("close", cleanup);
    socket.on("error", cleanup);
    request.on("close", cleanup);
  });

  server.on("upgrade", (request, socket, head) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const match = url.pathname.match(wsRoutePattern);

    if (!match) {
      nextUpgradeHandler(request, socket, head);
      return;
    }

    const runId = decodeURIComponent(match[1]);

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request, runId);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`> ReplayX dashboard listening on http://${hostname}:${port}`);
  });
});
