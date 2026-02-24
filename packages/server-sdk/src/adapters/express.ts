import { resolveConfig } from '../core/config';
import { detectAgent } from '../core/detector';
import { shouldSkipRequest } from '../core/filter';
import { EventBuffer } from '../core/buffer';
import type { AgentPulseUserConfig, RequestInfo, ServerEvent } from '../core/types';

interface ExpressRequest {
  method: string;
  url: string;
  path: string;
  ip: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ExpressResponse {
  statusCode: number;
  on(event: string, listener: () => void): void;
}

type NextFunction = (err?: unknown) => void;

/**
 * Express middleware for tracking AI agent traffic.
 *
 * @example
 * ```typescript
 * import { agentPulse } from '@agent-analytics/server-sdk';
 * app.use(agentPulse({ siteId: 'aa_xxx' }));
 * ```
 */
export function agentPulse(
  userConfig: AgentPulseUserConfig,
): (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => void {
  const config = resolveConfig(userConfig);
  const buffer = new EventBuffer(
    config.endpoint,
    config.flushSize,
    config.flushInterval,
    config.debug,
  );

  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    // Call next() immediately — non-blocking
    next();

    const reqInfo: RequestInfo = {
      method: req.method,
      url: req.url,
      path: req.path,
      userAgent: (req.headers['user-agent'] as string) ?? '',
      referer: req.headers['referer'] as string | undefined,
      accept: req.headers['accept'] as string | undefined,
      ip: req.ip,
    };

    // Skip static files and non-page requests
    if (shouldSkipRequest(reqInfo)) {
      return;
    }

    // Custom skip filter
    if (config.skip?.(reqInfo)) {
      return;
    }

    // Wait for response to finish to capture status code
    res.on('finish', () => {
      try {
        reqInfo.statusCode = res.statusCode;

        const detection = detectAgent(reqInfo);
        if (!detection.isAgent) {
          return;
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

        buffer.push(event);
      } catch {
        // Fail silently — never crash host app
      }
    });
  };
}
