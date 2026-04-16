import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

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

test("live run defaults resolve the repo root when launched from the dashboard directory", async () => {
  const repoRoot = process.cwd();
  const tempRepo = await mkdtemp(path.join(os.tmpdir(), "replayx-dashboard-cwd-"));
  const previousCwd = process.cwd();

  try {
    process.chdir(path.join(repoRoot, "dashboard"));

    const moduleUrl = `${pathToFileURL(path.join(repoRoot, "dashboard/lib/live-runs.ts")).href}?dashboard-cwd=${Date.now()}`;
    const liveRuns = await import(moduleUrl) as typeof import("../dashboard/lib/live-runs.js");
    const run = await liveRuns.createReplayXRun(
      {
        source: "slack",
        text: "checkout race condition from Slack",
        channel: "CBUGS123"
      },
      {
        runStoreRoot: path.join(tempRepo, ".replayx-runs"),
        artifactsRoot: path.join(tempRepo, "artifacts"),
        phaseDelayMs: 0
      }
    );

    assert.equal(run.incidentId, "incident-checkout-race-001");
    assert.equal(run.incidentPath, path.join(repoRoot, "incidents", "checkout-race-condition.json"));
  } finally {
    process.chdir(previousCwd);
    await rm(tempRepo, { recursive: true, force: true });
  }
});
