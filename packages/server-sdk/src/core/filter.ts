import { STATIC_EXTENSIONS, type RequestInfo } from './types';

/**
 * Returns true if the request should be skipped (not tracked).
 * Skips static assets and non-GET/POST methods.
 */
export function shouldSkipRequest(req: RequestInfo): boolean {
  // Only track GET and POST requests
  const method = req.method.toUpperCase();
  if (method !== 'GET' && method !== 'POST') {
    return true;
  }

  // Skip requests for static files
  const path = req.path.split('?')[0] ?? req.path;
  const lastDot = path.lastIndexOf('.');
  if (lastDot !== -1) {
    const ext = path.slice(lastDot).toLowerCase();
    if (STATIC_EXTENSIONS.has(ext)) {
      return true;
    }
  }

  // Skip common non-page paths
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_next/') ||
    path.startsWith('/__') ||
    path === '/favicon.ico' ||
    path === '/robots.txt' ||
    path === '/sitemap.xml' ||
    path === '/health' ||
    path === '/healthz'
  ) {
    return true;
  }

  return false;
}
