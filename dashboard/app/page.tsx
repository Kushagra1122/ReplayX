import Link from "next/link";
import { GOLDEN_INCIDENT_ID, listReplayIncidents, loadReplayIncidentBundle } from "../lib/replay-data";

export default async function HomePage() {
  const incidents = await listReplayIncidents();
  const goldenBundle = await loadReplayIncidentBundle(GOLDEN_INCIDENT_ID);

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">ReplayX</span>
          <h1>Incident response built on Codex, shown as a replay judges can understand instantly.</h1>
          <p>
            Start from one broken app, watch specialist workers converge on the root cause, and show the
            proof trail without relying on a fragile live run.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={`/incidents/${GOLDEN_INCIDENT_ID}`}>
              Open golden replay
            </Link>
            <a className="button button-secondary" href="#incident-list">
              Browse saved incidents
            </a>
          </div>
        </div>
        <div className="hero-panel card">
          <p className="panel-label">Golden incident</p>
          <h2>{goldenBundle.incident.title}</h2>
          <p>{goldenBundle.incident.summary.symptom}</p>
          <dl className="metrics-grid">
            <div>
              <dt>Service</dt>
              <dd>{goldenBundle.incident.service}</dd>
            </div>
            <div>
              <dt>Severity</dt>
              <dd>{goldenBundle.incident.severity.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Diagnosis workers</dt>
              <dd>{goldenBundle.diagnosis?.worker_count ?? 0}</dd>
            </div>
            <div>
              <dt>Replay mode</dt>
              <dd>Saved artifacts</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Judge flow</span>
          <h2>Understand the system in under 30 seconds</h2>
        </div>
        <div className="story-grid">
          {[
            "A broken app creates a visible production incident.",
            "ReplayX ingests the incident bundle and confirms the repro.",
            "Specialist workers fan out and rank the root-cause diagnosis.",
            "The chosen diagnosis rolls into fix, proof, and reusable knowledge."
          ].map((step, index) => (
            <article className="story-card card" key={step}>
              <span className="story-index">0{index + 1}</span>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="incident-list">
        <div className="section-header">
          <span className="section-kicker">Saved replays</span>
          <h2>Available incidents</h2>
        </div>
        <div className="incident-grid">
          {incidents.map((incident) => (
            <Link className="incident-card card" key={incident.incidentId} href={`/incidents/${incident.incidentId}`}>
              <div className="incident-card-header">
                <span className="pill">{incident.severity.toUpperCase()}</span>
                <span className="ghost-text">{incident.environment}</span>
              </div>
              <h3>{incident.title}</h3>
              <p>{incident.summary.symptom}</p>
              <div className="incident-card-footer">
                <span>{incident.service}</span>
                <span>Open replay</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
