import { resolveConfig } from '../core/config';
import { detectAgent } from '../core/detector';
import { shouldSkipRequest } from '../core/filter';
import { EventBuffer } from '../core/buffer';
import type { AgentPulseUserConfig, RequestInfo, ServerEvent } from '../core/types';

interface FastifyRequest {
  method: string;
  url: string;
  headers: Record<string, string | string[] | undefined>;
  ip: string;
}

interface FastifyReply {
  statusCode: number;
}

interface FastifyInstance {
  addHook(
    name: 'onResponse',
    hook: (request: FastifyRequest, reply: FastifyReply, done: () => void) => void,
  ): void;
  addHook(name: 'onClose', hook: (done: () => void) => void): void;
}

/**
 * Fastify plugin for tracking AI agent traffic.
 *
 * @example
 * ```typescript
 * import { agentPulsePlugin } from '@agent-analytics/server-sdk/fastify';
 * fastify.register(agentPulsePlugin, { siteId: 'aa_xxx' });
 * ```
 */
export function agentPulsePlugin(
  fastify: FastifyInstance,
  opts: AgentPulseUserConfig,
  done: (err?: Error) => void,
): void {
  const config = resolveConfig(opts);
  const buffer = new EventBuffer(
    config.endpoint,
    config.flushSize,
    config.flushInterval,
    config.debug,
  );

  fastify.addHook('onResponse', (request, reply, hookDone) => {
    try {
      // Extract path from URL (remove query string)
      const urlPath = request.url.split('?')[0] ?? request.url;

      const reqInfo: RequestInfo = {
        method: request.method,
        url: request.url,
        path: urlPath,
        userAgent: (request.headers['user-agent'] as string) ?? '',
        referer: request.headers['referer'] as string | undefined,
        accept: request.headers['accept'] as string | undefined,
        ip: request.ip,
        statusCode: reply.statusCode,
      };

      // Skip static files and non-page requests
      if (shouldSkipRequest(reqInfo)) {
        hookDone();
        return;
      }

      // Custom skip filter
      if (config.skip?.(reqInfo)) {
        hookDone();
        return;
      }

      const detection = detectAgent(reqInfo);
      if (!detection.isAgent) {
        hookDone();
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

    hookDone();
  });

  fastify.addHook('onClose', (closeDone) => {
    buffer.destroy();
    closeDone();
  });

  done();
}
