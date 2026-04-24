"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }








var _chunkMNIVAKB6cjs = require('./chunk-MNIVAKB6.cjs');
require('./chunk-75ZPJI57.cjs');

// src/observability/middleware.ts
var _reactstart = require('@tanstack/react-start');
function tryGetRoute(result, fallback) {
  try {
    const r = result;
    if (_optionalChain([r, 'optionalAccess', _ => _.context, 'optionalAccess', _2 => _2.matchedRouteId])) return r.context.matchedRouteId;
  } catch (e) {
  }
  return fallback;
}
var loggingMiddleware = _reactstart.createMiddleware.call(void 0, { type: "request" }).server(
  async ({ next, request, pathname }) => {
    const start = process.hrtime.bigint();
    const method = request.method;
    try {
      const result = await next();
      const duration = Number(process.hrtime.bigint() - start) / 1e9;
      const status = result.response.status;
      const route = tryGetRoute(result, "unknown");
      _chunkMNIVAKB6cjs.httpRequestsTotal.inc({ method, route, status });
      _chunkMNIVAKB6cjs.httpRequestDurationSeconds.observe({ method, route, status }, duration);
      _chunkMNIVAKB6cjs.logger.info(
        {
          method,
          path: pathname,
          route,
          status,
          duration_ms: Math.round(duration * 1e3)
        },
        "http_request"
      );
      return result;
    } catch (err) {
      const duration = Number(process.hrtime.bigint() - start) / 1e9;
      _chunkMNIVAKB6cjs.httpRequestsTotal.inc({ method, route: "unknown", status: 500 });
      _chunkMNIVAKB6cjs.httpRequestDurationSeconds.observe(
        { method, route: "unknown", status: 500 },
        duration
      );
      _chunkMNIVAKB6cjs.logger.error(
        {
          method,
          path: pathname,
          err,
          duration_ms: Math.round(duration * 1e3)
        },
        "http_request_failed"
      );
      throw err;
    }
  }
);










exports.httpRequestDurationSeconds = _chunkMNIVAKB6cjs.httpRequestDurationSeconds; exports.httpRequestsTotal = _chunkMNIVAKB6cjs.httpRequestsTotal; exports.isAllowed = _chunkMNIVAKB6cjs.isAllowed; exports.isLocalNetworkIp = _chunkMNIVAKB6cjs.isLocalNetworkIp; exports.jobDurationSeconds = _chunkMNIVAKB6cjs.jobDurationSeconds; exports.jobsTotal = _chunkMNIVAKB6cjs.jobsTotal; exports.logger = _chunkMNIVAKB6cjs.logger; exports.loggingMiddleware = loggingMiddleware; exports.register = _chunkMNIVAKB6cjs.register;
