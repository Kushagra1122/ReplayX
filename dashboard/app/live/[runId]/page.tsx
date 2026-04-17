import Link from "next/link";

import { LiveRunClient } from "./live-run-client";

export default async function LiveRunPage({
  params
}: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await params;

  return (
    <main className="shell replay-shell">
      <header className="replay-header">
        <div>
          <Link className="ghost-link" href="/">
            ← Back to replay index
          </Link>
          <span className="eyebrow">Slack-triggered live run</span>
          <h1>ReplayX is investigating</h1>
          <p className="lead">
            Slack handed this incident to the ReplayX orchestrator. This page updates live over a socket
            connection as each investigation phase completes.
          </p>
        </div>
      </header>
      <LiveRunClient runId={runId} />
    </main>
  );
}
