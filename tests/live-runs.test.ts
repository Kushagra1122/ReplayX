import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  createReplayXRun,
  getReplayXRun,
  runReplayXLivePipeline
} from "../dashboard/lib/live-runs.js";

test("live run store creates a Slack-sourced run and completes the ReplayX phase flow", async () => {
  const tempRepo = await mkdtemp(path.join(os.tmpdir(), "replayx-live-run-"));

  try {
    const run = await createReplayXRun(
      {
        source: "slack",
        text: "checkout is overselling inventory when two users buy at the same time",
        channel: "CBUGS123",
        threadTs: "171234.100"
      },
      {
        repoRoot: process.cwd(),
        runStoreRoot: path.join(tempRepo, ".replayx-runs"),
        artifactsRoot: path.join(tempRepo, "artifacts"),
        phaseDelayMs: 0
      }
    );

    assert.equal(run.source, "slack");
    assert.equal(run.status, "queued");
    assert.equal(run.issue.text.includes("overselling"), true);
    assert.equal(run.incidentId, "incident-checkout-race-001");
    assert.equal(run.phases[0].id, "incident-intake");

    await runReplayXLivePipeline(run.runId, {
      repoRoot: process.cwd(),
      runStoreRoot: path.join(tempRepo, ".replayx-runs"),
      artifactsRoot: path.join(tempRepo, "artifacts"),
      phaseDelayMs: 0
    });

    const completed = await getReplayXRun(run.runId, {
      repoRoot: process.cwd(),
      runStoreRoot: path.join(tempRepo, ".replayx-runs"),
      artifactsRoot: path.join(tempRepo, "artifacts"),
      phaseDelayMs: 0
    });

    assert.equal(completed.status, "completed");
    assert.equal(completed.currentPhaseId, "postmortem-and-skill");
    assert.equal(completed.phases.every((phase) => phase.status === "completed"), true);
    assert.match(completed.cards.winningDiagnosis.diagnosis, /inventory|checkout|race/i);
    assert.match(completed.cards.fix.summary, /stock|reservation|checkout/i);
    assert.match(completed.cards.skill.summary, /fast-path|checkout-race-condition/i);
  } finally {
    await rm(tempRepo, { recursive: true, force: true });
  }
});
