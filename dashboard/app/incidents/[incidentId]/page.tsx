import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPercent,
  formatTimestamp,
  loadReplayIncidentBundle,
  type ReplayWorkerCard
} from "../../../lib/replay-data";

function StatusBadge({ tone, children }: { tone: "danger" | "neutral" | "success" | "warning"; children: string }) {
  return <span className={`pill pill-${tone}`}>{children}</span>;
}

function WorkerCard({ worker }: { worker: ReplayWorkerCard }) {
  const tone =
    worker.status === "completed" ? "success" : worker.status === "weak_signal" ? "warning" : "neutral";

  return (
    <article className="card worker-card">
      <div className="worker-topline">
        <div>
          <p className="worker-label">{worker.label}</p>
          <h3>{worker.shortTitle}</h3>
        </div>
        <StatusBadge tone={tone}>{worker.status.replace("_", " ")}</StatusBadge>
      </div>
      <p className="worker-diagnosis">{worker.diagnosis}</p>
      <dl className="worker-meta">
        <div>
          <dt>Confidence</dt>
          <dd>{formatPercent(worker.confidence)}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{worker.mode}</dd>
        </div>
      </dl>
      <ul className="bullet-list">
        {worker.observations.slice(0, 3).map((observation) => (
          <li key={observation}>{observation}</li>
        ))}
      </ul>
    </article>
  );
}

function TimelineStep({
  title,
  detail,
  status
}: {
  title: string;
  detail: string;
  status: "done" | "now" | "next";
}) {
  return (
    <li className={`timeline-step timeline-${status}`}>
      <span className="timeline-dot" />
      <div>
        <p className="timeline-title">{title}</p>
        <p className="timeline-detail">{detail}</p>
      </div>
    </li>
  );
}

export default async function IncidentReplayPage({
  params
}: {
  params: Promise<{ incidentId: string }>;
}) {
  const { incidentId } = await params;
  const bundle = await loadReplayIncidentBundle(incidentId).catch(() => null);

  if (!bundle) {
    notFound();
  }

  const beforeAfter = bundle.beforeAfter;
  const winner = bundle.winningDiagnosis;

  return (
    <main className="shell replay-shell">
      <header className="replay-header">
        <div>
          <Link className="ghost-link" href="/">
            ← Back to replay index
          </Link>
          <span className="eyebrow">Golden replay</span>
          <h1>{bundle.incident.title}</h1>
          <p className="lead">{bundle.incident.summary.customerImpact}</p>
        </div>
        <div className="header-actions">
          <StatusBadge tone="danger">{bundle.incident.severity.toUpperCase()}</StatusBadge>
          <StatusBadge tone={bundle.repro?.repro_confirmed ? "success" : "warning"}>
            {bundle.repro?.repro_confirmed ? "Repro confirmed" : "Repro partial"}
          </StatusBadge>
        </div>
      </header>

      <section className="overview-grid">
        <article className="card spotlight-card">
          <span className="section-kicker">Incident summary</span>
          <h2>{bundle.incident.summary.symptom}</h2>
          <p>{bundle.repro?.failure_surface ?? "Replay artifact missing failure surface."}</p>
          <div className="overview-stats">
            <div>
              <span>Service</span>
              <strong>{bundle.incident.service}</strong>
            </div>
            <div>
              <span>Environment</span>
              <strong>{bundle.incident.environment}</strong>
            </div>
            <div>
              <span>First observed</span>
              <strong>{formatTimestamp(bundle.incident.summary.firstObservedAt)}</strong>
            </div>
            <div>
              <span>Customer visible</span>
              <strong>{bundle.incident.summary.customerVisible ? "Yes" : "No"}</strong>
            </div>
          </div>
        </article>

        <article className="card">
          <span className="section-kicker">Failing signal</span>
          <h2>Broken before the fix</h2>
          <p>{beforeAfter.beforeLabel}</p>
          <pre className="signal-block">{beforeAfter.beforeEvidence}</pre>
        </article>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Worker fan-out</span>
          <h2>Specialists race to the root cause</h2>
          <p>
            ReplayX fans out bounded diagnosis workers, ranks the shortlist, and keeps the proof tied to real
            files and observed signals.
          </p>
        </div>
        <div className="worker-grid">
          {bundle.workerCards.map((worker) => (
            <WorkerCard key={worker.workerId} worker={worker} />
          ))}
        </div>
      </section>

      <section className="two-up-grid">
        <article className="card winner-card">
          <span className="section-kicker">Winning diagnosis</span>
          <h2>{winner?.shortTitle ?? "Top diagnosis pending"}</h2>
          <p className="winner-summary">{winner?.diagnosis ?? "No winning diagnosis artifact is available yet."}</p>
          <div className="winner-metrics">
            <div>
              <span>Confidence</span>
              <strong>{winner ? formatPercent(winner.confidence) : "Pending"}</strong>
            </div>
            <div>
              <span>Primary files</span>
              <strong>{winner?.candidateFiles.slice(0, 2).join(", ") ?? "Pending"}</strong>
            </div>
          </div>
          <ul className="bullet-list">
            {(winner?.observations ?? bundle.incident.constraints).slice(0, 3).map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <span className="section-kicker">Fix result</span>
          <h2>{bundle.fixCard.title}</h2>
          <p>{bundle.fixCard.summary}</p>
          <ul className="bullet-list">
            {bundle.fixCard.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="three-up-grid">
        <article className="card">
          <span className="section-kicker">Proof / regression</span>
          <h2>{bundle.proofCard.title}</h2>
          <p>{bundle.proofCard.summary}</p>
          <ul className="bullet-list">
            {bundle.proofCard.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <span className="section-kicker">Postmortem</span>
          <h2>{bundle.postmortemCard.title}</h2>
          <p>{bundle.postmortemCard.summary}</p>
          <ul className="bullet-list">
            {bundle.postmortemCard.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>

        <article className="card">
          <span className="section-kicker">Reusable skill</span>
          <h2>{bundle.skillCard.title}</h2>
          <p>{bundle.skillCard.summary}</p>
          <ul className="bullet-list">
            {bundle.skillCard.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Timeline</span>
          <h2>How ReplayX tells the story</h2>
        </div>
        <div className="timeline-layout">
          <ol className="timeline-list">
            {bundle.timeline.map((item) => (
              <TimelineStep key={item.title} title={item.title} detail={item.detail} status={item.status} />
            ))}
          </ol>
          <article className="card before-after-card">
            <span className="section-kicker">Before / after framing</span>
            <h2>{beforeAfter.afterLabel}</h2>
            <pre className="signal-block signal-block-success">{beforeAfter.afterEvidence}</pre>
          </article>
        </div>
      </section>
    </main>
  );
}
