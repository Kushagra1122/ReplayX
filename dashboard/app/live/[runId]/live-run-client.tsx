"use client";

import { useEffect, useMemo, useState } from "react";

import type { ReplayXLiveRun } from "../../../lib/live-runs";

type LiveRunResponse = {
  ok: boolean;
  run: ReplayXLiveRun;
};

type LiveRunStreamResponse =
  | {
      ok: true;
      run: ReplayXLiveRun;
    }
  | {
      ok: false;
      error: string;
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
    let eventSource: EventSource | null = null;
    let webSocket: WebSocket | null = null;

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

    const startPolling = () => {
      if (cancelled) {
        return;
      }
      void load();
    };

    const startSseFallback = () => {
      eventSource = new EventSource(`/api/replayx/runs/${encodeURIComponent(runId)}/events`);

      eventSource.onmessage = (event) => {
        if (cancelled) {
          return;
        }

        try {
          const payload = JSON.parse(event.data) as LiveRunStreamResponse;

          if (!payload.ok) {
            setError(payload.error);
            return;
          }

          setRun(payload.run);
          setError(null);

          if (payload.run.status === "completed" || payload.run.status === "failed") {
            eventSource?.close();
          }
        } catch {
          setError("Received invalid run stream payload");
        }
      };

      eventSource.onerror = () => {
        if (cancelled) {
          return;
        }

        eventSource?.close();
        startPolling();
      };
    };

    const connectStream = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socketUrl = `${protocol}//${window.location.host}/api/replayx/runs/${encodeURIComponent(runId)}/ws`;
      webSocket = new WebSocket(socketUrl);

      webSocket.onmessage = (event) => {
        if (cancelled) {
          return;
        }

        try {
          const payload = JSON.parse(String(event.data)) as LiveRunStreamResponse;

          if (!payload.ok) {
            setError(payload.error);
            return;
          }

          setRun(payload.run);
          setError(null);

          if (payload.run.status === "completed" || payload.run.status === "failed") {
            webSocket?.close();
          }
        } catch {
          setError("Received invalid websocket payload");
        }
      };

      webSocket.onerror = () => {
        if (cancelled) {
          return;
        }

        webSocket?.close();
        startSseFallback();
      };

      webSocket.onclose = () => {
        if (cancelled || run?.status === "completed" || run?.status === "failed") {
          return;
        }

        startPolling();
      };
    };

    connectStream();

    return () => {
      cancelled = true;
      webSocket?.close();
      eventSource?.close();
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [runId, run?.status]);

  const currentPhase = useMemo(
    () => run?.phases.find((phase) => phase.id === run.currentPhaseId) ?? null,
    [run]
  );
  const isCompleted = run?.status === "completed";
  const hasFinalArtifacts = Boolean(
    run &&
      isCompleted &&
      (run.cards.skill.summary || run.cards.skill.path || run.cards.postmortem.summary || run.cards.postmortem.path)
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
      <section className="replay-ribbon" style={{ marginBottom: '4rem' }}>
        <article className="card spotlight-card">
          <div
            className="live-card-heading"
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
          >
            <span className="section-kicker" style={{ margin: 0 }}>Slack report</span>
            <StatusBadge status={run.status} />
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.75rem", marginBottom: "1.5rem" }}>{run.issue.text}</h2>
          <div className="worker-meta">
            <div>
              <span>Current Phase</span>
              <strong style={{ color: "var(--accent)" }}>{currentPhase?.label ?? "Queued"}</strong>
            </div>
            <div>
              <span>Run ID</span>
              <strong>{runId}</strong>
            </div>
          </div>
          {run.error ? (
            <p style={{ color: "var(--accent)", marginTop: "1rem", fontSize: "0.875rem" }}>{run.error}</p>
          ) : null}
        </article>

        <article className="card">
          <span className="section-kicker">Leading Diagnosis</span>
          <h2 style={{ fontFamily: "var(--font-display)", marginBottom: "1rem" }}>
            {run.cards.winningDiagnosis.worker || "Pending"}
          </h2>
          <p style={{ fontSize: "0.9375rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
            {run.cards.winningDiagnosis.diagnosis}
          </p>
          <div className="worker-meta">
            <div>
              <span>Confidence</span>
              <strong style={{ color: "var(--success)" }}>{formatPercent(run.cards.winningDiagnosis.confidence)}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Orchestration</span>
          <h2>Live Investigation Progress</h2>
          <p>Live phase updates stream into this page as the orchestrator advances the run.</p>
        </div>
        <div className="story-grid">
          {run.phases.map((phase) => (
            <article
              className="card"
              key={phase.id}
              style={{ borderLeft: phase.status === "running" ? "4px solid var(--warning)" : "none" }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
              >
                <h3 style={{ fontSize: "1.125rem" }}>{phase.label}</h3>
                <StatusBadge status={phase.status} />
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{phase.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Worker Fleet</span>
          <h2>Diagnosis Arena</h2>
        </div>
        <div className="worker-grid">
          {run.cards.workerCards.length > 0 ? (
            run.cards.workerCards.map((worker) => (
              <article className="card" key={worker.worker}>
                <div
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
                >
                  <h3 style={{ fontSize: "1rem", color: "var(--accent)" }}>{worker.specialty}</h3>
                  <StatusBadge status={worker.status} />
                </div>
                <p style={{ fontSize: "0.9375rem", marginBottom: "1.5rem" }}>{worker.diagnosis}</p>
                <div className="worker-meta">
                  <div>
                    <span>Confidence</span>
                    <strong>{formatPercent(worker.confidence)}</strong>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "4rem" }}>
              <h3 style={{ color: "var(--muted)" }}>Workers queued</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
                Specialist cards appear as the arena warms up.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="three-up-grid">
          <article className="card">
            <span className="section-kicker">Fix Action</span>
            <h2 style={{ fontFamily: "var(--font-display)", margin: "1rem 0" }}>{run.cards.fix.strategy || "Pending"}</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{run.cards.fix.summary}</p>
            <ul className="bullet-list" style={{ marginTop: "1rem" }}>
              {run.cards.fix.changed_files.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </article>

          <article className="card">
            <span className="section-kicker">Verification</span>
            <h2 style={{ fontFamily: "var(--font-display)", margin: "1rem 0" }}>{run.cards.proof.review_verdict || "Pending"}</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1rem" }}>
              {run.cards.proof.regression_summary}
            </p>
            {run.cards.proof.regression_command && (
              <pre className="signal-block" style={{ fontSize: "0.7rem" }}>{run.cards.proof.regression_command}</pre>
            )}
          </article>

          {hasFinalArtifacts ? (
            <article className="card">
              <span className="section-kicker">Memory</span>
              <h2 style={{ fontFamily: "var(--font-display)", margin: "1rem 0" }}>Reusable Skill</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                {run.cards.skill.summary || "Skill artifact generated."}
              </p>
              <p style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--muted)" }}>{run.cards.skill.path}</p>
            </article>
          ) : (
            <article className="card">
              <span className="section-kicker">Final artifacts</span>
              <h2 style={{ fontFamily: "var(--font-display)", margin: "1rem 0" }}>Postmortem and skill pending</h2>
              <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
                ReplayX only publishes reusable incident memory after the run completes and the final review artifacts are written.
              </p>
            </article>
          )}
        </div>
      </section>
    </>
  );
}
