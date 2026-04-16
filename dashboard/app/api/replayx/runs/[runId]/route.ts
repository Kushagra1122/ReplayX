import { getReplayXRun } from "../../../../../lib/live-runs";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  try {
    const run = await getReplayXRun(runId);
    return Response.json({ ok: true, run });
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === "ENOENT") {
      return Response.json({ error: "Run not found" }, { status: 404 });
    }

    throw error;
  }
}
