import {
  createReplayXRun,
  startReplayXLivePipeline,
  startReplayXLivePipelineDetached
} from "../../../../lib/live-runs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const isAuthorized = (request: Request): boolean => {
  const expectedToken = process.env.REPLAYX_INTERNAL_API_TOKEN;

  if (!expectedToken) {
    return true;
  }

  return request.headers.get("authorization") === `Bearer ${expectedToken}`;
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    source?: "slack" | "manual";
    text?: string;
    channel?: string;
    threadTs?: string;
    user?: string;
  } | null;

  if (!body?.text || typeof body.text !== "string") {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const run = await createReplayXRun({
    source: body.source ?? "manual",
    text: body.text,
    channel: body.channel,
    threadTs: body.threadTs,
    user: body.user
  });

  try {
    startReplayXLivePipelineDetached(run.runId);
  } catch {
    // Fallback for environments where detached process spawn is unavailable.
    startReplayXLivePipeline(run.runId);
  }

  return Response.json(
    {
      ok: true,
      run,
      runId: run.runId,
      livePath: `/live/${run.runId}`
    },
    { status: 201 }
  );
}
