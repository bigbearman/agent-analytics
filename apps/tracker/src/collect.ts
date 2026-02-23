import type { AgentEvent, AgentInfo } from '@agent-analytics/types';

const COLLECT_ENDPOINT = '/collect';

/**
 * Fire-and-forget POST event — does not block page load
 * Uses sendBeacon (fallback: fetch) to send even when tab is closing
 */
export function sendEvent(
  endpoint: string,
  event: AgentEvent,
): void {
  const url = endpoint + COLLECT_ENDPOINT;
  const body = JSON.stringify(event);

  // Prefer sendBeacon — ensures delivery when user closes tab
  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    const sent = navigator.sendBeacon(url, blob);
    if (sent) return;
  }

  // Fallback: fetch fire-and-forget
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Silently fail — do not block user experience
  });
}

/**
 * Create event payload
 */
export function createEvent(
  siteId: string,
  action: AgentEvent['action'],
  agent: AgentInfo,
  meta?: Record<string, unknown>,
): AgentEvent {
  return {
    siteId,
    url: window.location.href,
    action,
    agent,
    timestamp: Date.now(),
    meta,
  };
}
