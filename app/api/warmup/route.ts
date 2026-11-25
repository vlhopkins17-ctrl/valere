export const maxDuration = 60;

// Wakes the fitness MCP service, which sleeps on Render's free plan after
// ~15 minutes without traffic and takes 30-60s to start again. Pages call this
// on load so the service is starting up while the user signs in or types.
// POST keeps it out of caching and prerendering.
export async function POST() {
  const fitnessMcpUrl = process.env.FITNESS_MCP_URL;
  if (!fitnessMcpUrl) {
    return new Response(null, { status: 204 });
  }

  try {
    // Any request wakes the service; the status code doesn't matter.
    // Awaiting keeps the request alive on serverless hosts until it lands.
    await fetch(fitnessMcpUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: AbortSignal.timeout(55_000),
    });
  } catch {
    // Timeouts and network errors are fine: the wake-up has been triggered.
  }

  return new Response(null, { status: 204 });
}
