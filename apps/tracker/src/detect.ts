import { KNOWN_AGENTS, CONFIDENCE, type KnownAgentName, type AgentInfo } from '@agent-analytics/types';

/**
 * Layer 1: Client-side User Agent matching
 * Kiểm tra UA string có match với known AI agents không
 */
function matchUserAgent(): { name: KnownAgentName; confidence: number } | null {
  const ua = navigator.userAgent;
  for (const [name, pattern] of Object.entries(KNOWN_AGENTS)) {
    if (pattern.test(ua)) {
      return { name: name as KnownAgentName, confidence: CONFIDENCE.SERVER_UA };
    }
  }
  return null;
}

/**
 * Layer 2: Behavioral detection
 * - Không có mousemove trong 5 giây đầu
 * - Không có scroll events
 * - Không có focus/blur events
 */
function detectBehavioral(): Promise<{ isBot: boolean; confidence: number }> {
  return new Promise((resolve) => {
    let hasMouseMove = false;
    let hasScroll = false;
    let hasFocusBlur = false;

    const onMouseMove = () => { hasMouseMove = true; };
    const onScroll = () => { hasScroll = true; };
    const onFocus = () => { hasFocusBlur = true; };

    document.addEventListener('mousemove', onMouseMove, { once: true });
    document.addEventListener('scroll', onScroll, { once: true });
    window.addEventListener('focus', onFocus, { once: true });
    window.addEventListener('blur', onFocus, { once: true });

    // Check sau 5 giây
    setTimeout(() => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('scroll', onScroll);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('blur', onFocus);

      const isBot = !hasMouseMove && !hasScroll && !hasFocusBlur;
      resolve({
        isBot,
        confidence: isBot ? CONFIDENCE.BEHAVIORAL : 0,
      });
    }, 5000);
  });
}

/**
 * Detect agent — fire ngay Layer 1 (UA), Layer 2 (behavioral) chạy background
 */
export function detectAgent(): AgentInfo {
  const uaMatch = matchUserAgent();

  if (uaMatch) {
    return {
      isAgent: true,
      agentName: uaMatch.name,
      confidence: uaMatch.confidence,
    };
  }

  // Chạy behavioral detection background, gửi update sau
  detectBehavioral().then((result) => {
    if (result.isBot && typeof window.__agentAnalyticsBehavioralCallback === 'function') {
      window.__agentAnalyticsBehavioralCallback({
        isAgent: true,
        agentName: 'unknown-behavioral',
        confidence: result.confidence,
      });
    }
  });

  return {
    isAgent: false,
    agentName: '',
    confidence: 0,
  };
}

// Extend window type cho behavioral callback
declare global {
  interface Window {
    __agentAnalyticsBehavioralCallback?: (agent: AgentInfo) => void;
  }
}
