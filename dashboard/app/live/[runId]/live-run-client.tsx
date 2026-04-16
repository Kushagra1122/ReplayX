"use client";

import { useEffect, useMemo, useState } from "react";

import type { ReplayXLiveRun } from "../../../lib/live-runs";

type LiveRunResponse = {
  ok: boolean;
  run: ReplayXLiveRun;
};

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function statusTone(status: string): "danger" | "neutral" | "success" | "warning" {
  if (status === "completed") {
    return "success";
  }
  if (status === "running") {
    return "warning";
  }
  if (status === "failed") {
    return "danger";
  }
  return "neutral";
}

function StatusBadge({ status }: { status: string }) {
  return <span className={`pill pill-${statusTone(status)}`}>{status.replaceAll("_", " ")}</span>;
}

export function LiveRunClient({ runId }: { runId: string }) {
  const [run, setRun] = useState<ReplayXLiveRun | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const load = async () => {
      try {
        const response = await fetch(`/api/replayx/runs/${encodeURIComponent(runId)}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          throw new Error(`Run API returned ${response.status}`);
        }

        const data = (await response.json()) as LiveRunResponse;

        if (cancelled) {
          return;
        }

        setRun(data.run);
        setError(null);

        if (data.run.status === "queued" || data.run.status === "running") {
          timer = setTimeout(load, 2000);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load run");
          timer = setTimeout(load, 3000);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [runId]);

  const currentPhase = useMemo(
    () => run?.phases.find((phase) => phase.id === run.currentPhaseId) ?? null,
    [run]
  );

  if (error && !run) {
    return (
      <article className="card">
        <span className="section-kicker">Waiting for run</span>
        <h2>Run status is not available yet</h2>
        <p className="ghost-text">{error}</p>
      </article>
    );
  }

  if (!run) {
    return (
      <article className="card">
        <span className="section-kicker">Loading</span>
        <h2>Connecting to ReplayX run</h2>
        <p className="ghost-text">Run id: {runId}</p>
      </article>
    );
  }

  return (
    <>
      <section className="overview-grid">
        <article className="card spotlight-card">
          <div className="live-card-heading">
            <span className="section-kicker">Slack report</span>
            <StatusBadge status={run.status} />
          </div>
          <h2>{run.issue.text}</h2>
          <p>
            Current phase: <strong>{currentPhase?.label ?? "Queued"}</strong>
          </p>
          {run.error ? <p className="danger-text">{run.error}</p> : null}
        </article>

        <article className="card">
          <span className="section-kicker">Winning diagnosis</span>
          <h2>{run.cards.winningDiagnosis.worker}</h2>
          <p>{run.cards.winningDiagnosis.diagnosis}</p>
          <p className="ghost-text">{run.cards.winningDiagnosis.winning_reason}</p>
          <strong>{formatPercent(run.cards.winningDiagnosis.confidence)}</strong>
        </article>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Orchestration updates</span>
          <h2>ReplayX phases</h2>
        </div>
        <div className="live-phase-grid">
          {run.phases.map((phase) => (
            <article className="card live-phase-card" key={phase.id}>
              <div className="live-card-heading">
                <h3>{phase.label}</h3>
                <StatusBadge status={phase.status} />
              </div>
              <p>{phase.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Diagnosis arena</span>
          <h2>Workers</h2>
        </div>
        <div className="worker-grid">
          {run.cards.workerCards.length > 0 ? (
            run.cards.workerCards.map((worker) => (
              <article className="card worker-card" key={worker.worker}>
                <div className="worker-topline">
                  <h3>{worker.specialty}</h3>
                  <StatusBadge status={worker.status} />
                </div>
                <p className="worker-diagnosis">{worker.diagnosis}</p>
                <p className="ghost-text">Confidence {formatPercent(worker.confidence)}</p>
              </article>
            ))
          ) : (
            <article className="card">
              <h3>Workers queued</h3>
              <p className="ghost-text">Cards appear as the diagnosis arena finishes.</p>
            </article>
          )}
        </div>
      </section>

      <section className="three-up-grid">
        <article className="card">
          <span className="section-kicker">Fix</span>
          <h2>{run.cards.fix.strategy}</h2>
          <p>{run.cards.fix.summary}</p>
          <ul className="bullet-list">
            {run.cards.fix.changed_files.map((file) => (
              <li key={file}>{file}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <span className="section-kicker">Proof</span>
          <h2>{run.cards.proof.review_verdict}</h2>
          <p>{run.cards.proof.regression_summary}</p>
          <pre className="signal-block signal-block-success">{run.cards.proof.regression_command}</pre>
        </article>

        <article className="card">
          <span className="section-kicker">New skill</span>
          <h2>Reusable incident memory</h2>
          <p>{run.cards.skill.summary}</p>
          <p className="ghost-text">{run.cards.skill.path}</p>
        </article>
      </section>
    </>
  );
}
