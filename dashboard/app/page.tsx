import Link from "next/link";
import { GOLDEN_INCIDENT_ID, listReplayIncidents, loadReplayIncidentBundle } from "../lib/replay-data";

export default async function HomePage() {
  const incidents = await listReplayIncidents();
  let goldenBundle;
  try {
    goldenBundle = await loadReplayIncidentBundle(GOLDEN_INCIDENT_ID);
  } catch (e) {
    // Fallback if bundle not found during build
    goldenBundle = { 
      incident: { incidentId: "offline", title: "Incident Replay", summary: { symptom: "Sample symptom" }, service: "N/A", severity: "high" },
      diagnosis: { worker_count: 0 }
    };
  }

  const judgeFlow = [
    {
      title: "Visible failure",
      body: "A broken application state creates a user-visible failure with deterministic evidence."
    },
    {
      title: "Structured intake",
      body: "ReplayX ingests signals and confirms the failure surface before specialists start work."
    },
    {
      title: "Bounded experts",
      body: "Specialist workers compete on root-cause explanations and push toward the strongest signal."
    },
    {
      title: "Verified proof",
      body: "The winning diagnosis generates a fix path, verification plan, and reusable incident memory."
    }
  ];

  return (
    <main className="shell shell-home">
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">RX</span>
          <div className="brand-copy">
            <strong>ReplayX</strong>
            <span>Codex-first incident replay</span>
          </div>
        </Link>
        <div className="site-status">
          <span className="site-status-label">Hackathon demo</span>
          <span className="site-status-value">Ready for review</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="section-kicker">The Engine</span>
          <h1>Incident response as a clean product story.</h1>
          <p>
            From a broken app to a verified fix. Replay diagnosis, fix strategy, 
            and incident knowledge without depending on a fragile live runtime.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={`/incidents/${GOLDEN_INCIDENT_ID}`}>
              Launch Golden Replay
            </Link>
            <a className="button button-secondary" href="#incident-list">
              View All Incidents
            </a>
          </div>
          <div className="hero-ledger">
            <div className="ledger-item">
              <span>Incident ID</span>
              <strong>{goldenBundle.incident.incidentId}</strong>
            </div>
            <div className="ledger-item">
              <span>Engine</span>
              <strong>Codex Orchestrator</strong>
            </div>
            <div className="ledger-item">
              <span>Output</span>
              <strong>Diagnosis → Proof</strong>
            </div>
          </div>
        </div>
        <div className="hero-aside">
          <div className="card spotlight-card">
            <span className="section-kicker">Featured Replay</span>
            <h2>{goldenBundle.incident.title}</h2>
            <p>{goldenBundle.incident.summary.symptom}</p>
            <div className="worker-meta" style={{ marginTop: '2rem' }}>
              <div>
                <dt>Service</dt>
                <dd>{goldenBundle.incident.service}</dd>
              </div>
              <div>
                <dt>Severity</dt>
                <dd className="pill-danger" style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
                  {goldenBundle.incident.severity.toUpperCase()}
                </dd>
              </div>
              <div>
                <dt>Workers</dt>
                <dd>{goldenBundle.diagnosis?.worker_count ?? 0} active</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Saved artifact</dd>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <span className="section-kicker">Product Flow</span>
          <h2>Understand ReplayX in 30 seconds</h2>
          <p>The core pipeline from intake to reusable skill generation.</p>
        </div>
        <div className="story-grid">
          {judgeFlow.map((step, index) => (
            <article className="card" key={step.title}>
              <span className="section-kicker" style={{ color: 'var(--text-dim)' }}>Step 0{index + 1}</span>
              <h3 style={{ marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>{step.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="incident-list">
        <div className="section-header">
          <span className="section-kicker">Replay Index</span>
          <h2>Historical Replays</h2>
          <p>Browse the library of incidents verified by the ReplayX engine.</p>
        </div>
        <div className="incident-grid">
          {incidents.map((incident) => (
            <Link
              className="card incident-card"
              key={incident.incidentId}
              href={`/incidents/${incident.incidentId}`}
            >
              <div className="incident-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`pill ${incident.severity === 'high' ? 'pill-danger' : 'pill-warning'}`}>
                  {incident.severity.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{incident.environment}</span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>{incident.title}</h3>
                <p style={{ marginTop: '0.5rem' }}>{incident.summary.symptom}</p>
              </div>
              <div className="incident-card-footer">
                <span>{incident.service}</span>
                <span style={{ color: 'var(--brand)', fontWeight: '600' }}>Replay →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
