import type { ServerEvent } from './types';

const COLLECT_PATH = '/collect';

/**
 * Send a batch of events to the API.
 * Fire-and-forget — errors are caught silently so the SDK never crashes the host app.
 */
export async function sendBatch(
  endpoint: string,
  events: ServerEvent[],
  debug: boolean,
): Promise<void> {
  const url = endpoint.replace(/\/$/, '') + COLLECT_PATH;

  const promises = events.map((event) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch((err: unknown) => {
      if (debug) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[AgentPulse] Failed to send event: ${message}`);
      }
    }),
  );

  await Promise.allSettled(promises);
}
