import type { AgentInfo } from '@agent-analytics/types';
import { detectAgent } from './detect';
import { sendEvent, createEvent } from './collect';

/**
 * Agent Analytics Tracker
 *
 * Embed via script tag:
 * <script async src="tracker.js" data-site="aa_xxxxx"></script>
 *
 * Or init manually:
 * AgentAnalytics.init({ siteId: 'aa_xxxxx', endpoint: 'https://api.agentanalytics.io' })
 */

interface TrackerConfig {
  siteId: string;
  endpoint: string;
}

let config: TrackerConfig | null = null;
let agentInfo: AgentInfo | null = null;

// Capture reference early because document.currentScript becomes null after script execution
const currentScript = document.currentScript as HTMLScriptElement | null;

function init(options: Partial<TrackerConfig> = {}): void {
  // Get config from script tag or options
  const siteId = options.siteId || currentScript?.getAttribute('data-site') || '';
  const endpoint =
    options.endpoint ||
    currentScript?.getAttribute('data-endpoint') ||
    window.location.origin;

  if (!siteId) {
    console.warn('[AgentAnalytics] Missing siteId. Add data-site attribute to script tag.');
    return;
  }

  config = { siteId, endpoint };

  // Detect agent immediately
  agentInfo = detectAgent();

  // Register behavioral callback
  window.__agentAnalyticsBehavioralCallback = (updatedAgent: AgentInfo) => {
    agentInfo = updatedAgent;
    // Re-send pageview with updated agent info
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
  // Override pushState and replaceState to detect SPA navigation
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

// Auto-init when loaded via script tag
if (currentScript) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => init());
  } else {
    init();
  }
}

// Export for manual init
export { init, track };
