import { resolveConfig } from '../core/config';
import { detectAgent } from '../core/detector';
import { shouldSkipRequest } from '../core/filter';
import { EventBuffer } from '../core/buffer';
import type { AgentPulseConfig, AgentPulseUserConfig, RequestInfo, ServerEvent } from '../core/types';

interface NextRequest {
  method: string;
  url: string;
  nextUrl: { pathname: string };
  headers: { get(name: string): string | null };
  ip?: string;
}

interface NextResponse {
  status: number;
}

// Singleton buffer — Next.js middleware may be re-invoked without re-importing
let sharedBuffer: EventBuffer | null = null;
let sharedConfig: AgentPulseConfig | null = null;

function getBuffer(config: AgentPulseConfig): EventBuffer {
  if (!sharedBuffer) {
    sharedConfig = config;
    sharedBuffer = new EventBuffer(
      config.endpoint,
      config.flushSize,
      config.flushInterval,
      config.debug,
    );
  }
  return sharedBuffer;
}

/**
 * Creates a Next.js middleware wrapper for tracking AI agent traffic.
 *
 * @example
 * ```typescript
 * // middleware.ts
 * import { createMiddleware } from '@agent-analytics/server-sdk/next';
 * export const middleware = createMiddleware({ siteId: 'aa_xxx' });
 * ```
 */
export function createMiddleware(
  userConfig: AgentPulseUserConfig,
): (request: NextRequest) => NextResponse | undefined {
  const config = resolveConfig(userConfig);

  return (request: NextRequest): NextResponse | undefined => {
    try {
      const reqInfo: RequestInfo = {
        method: request.method,
        url: request.url,
        path: request.nextUrl.pathname,
        userAgent: request.headers.get('user-agent') ?? '',
        referer: request.headers.get('referer') ?? undefined,
        accept: request.headers.get('accept') ?? undefined,
        ip: request.ip,
      };

      // Skip static files and non-page requests
      if (shouldSkipRequest(reqInfo)) {
        return undefined;
      }

      // Custom skip filter
      if (config.skip?.(reqInfo)) {
        return undefined;
      }

      const detection = detectAgent(reqInfo);
      if (!detection.isAgent) {
        return undefined;
      }

      const event: ServerEvent = {
        siteId: config.siteId,
        url: reqInfo.url,
        action: 'pageview',
        agent: {
          isAgent: detection.isAgent,
          agentName: detection.agentName,
          confidence: detection.confidence,
        },
        timestamp: Date.now(),
        source: 'server',
      };

      const buffer = getBuffer(config);
      buffer.push(event);
    } catch {
      // Fail silently — never crash host app
    }

    // Return undefined to let Next.js continue processing
    return undefined;
  };
}
