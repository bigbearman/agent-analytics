import type { AgentInfo } from '@agent-analytics/types';
import { detectAgent } from './detect';
import { sendEvent, createEvent } from './collect';

/**
 * Agent Analytics Tracker
 *
 * Nhúng qua script tag:
 * <script async src="tracker.js" data-site="aa_xxxxx"></script>
 *
 * Hoặc init thủ công:
 * AgentAnalytics.init({ siteId: 'aa_xxxxx', endpoint: 'https://api.agentanalytics.io' })
 */

interface TrackerConfig {
  siteId: string;
  endpoint: string;
}

let config: TrackerConfig | null = null;
let agentInfo: AgentInfo | null = null;

function init(options: Partial<TrackerConfig> = {}): void {
  // Lấy config từ script tag hoặc options
  const script = document.currentScript as HTMLScriptElement | null;
  const siteId = options.siteId || script?.getAttribute('data-site') || '';
  const endpoint =
    options.endpoint ||
    script?.getAttribute('data-endpoint') ||
    window.location.origin;

  if (!siteId) {
    console.warn('[AgentAnalytics] Missing siteId. Add data-site attribute to script tag.');
    return;
  }

  config = { siteId, endpoint };

  // Detect agent ngay
  agentInfo = detectAgent();

  // Register behavioral callback
  window.__agentAnalyticsBehavioralCallback = (updatedAgent: AgentInfo) => {
    agentInfo = updatedAgent;
    // Gửi lại pageview với thông tin mới
    track('pageview');
  };

  // Track pageview
  track('pageview');

  // Track errors
  window.addEventListener('error', (e) => {
    track('error', { message: e.message, filename: e.filename });
  });

  // Track page navigation (SPA)
  trackSPANavigation();
}

function track(
  action: 'pageview' | 'click' | 'fetch' | 'error',
  meta?: Record<string, unknown>,
): void {
  if (!config || !agentInfo) return;

  const event = createEvent(config.siteId, action, agentInfo, meta);
  sendEvent(config.endpoint, event);
}

function trackSPANavigation(): void {
  // Override pushState và replaceState để detect SPA navigation
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = (...args: Parameters<typeof history.pushState>) => {
    originalPushState(...args);
    track('pageview');
  };

  history.replaceState = (...args: Parameters<typeof history.replaceState>) => {
    originalReplaceState(...args);
    track('pageview');
  };

  window.addEventListener('popstate', () => {
    track('pageview');
  });
}

// Auto-init khi load qua script tag
if (document.currentScript) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}

// Export cho manual init
export { init, track };
