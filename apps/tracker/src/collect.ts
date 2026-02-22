import type { AgentEvent, AgentInfo } from '@agent-analytics/types';

const COLLECT_ENDPOINT = '/collect';

/**
 * Fire-and-forget POST event — không block page load
 * Dùng sendBeacon (fallback: fetch) để gửi ngay cả khi tab đóng
 */
export function sendEvent(
  endpoint: string,
  event: AgentEvent,
): void {
  const url = endpoint + COLLECT_ENDPOINT;
  const body = JSON.stringify(event);

  // Prefer sendBeacon — đảm bảo gửi được khi user close tab
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
    // Silently fail — không block user experience
  });
}

/**
 * Tạo event payload
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
