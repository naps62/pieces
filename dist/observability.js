import {
  isAllowed,
  isLocalNetworkIp
} from "./chunk-LKINEZ23.js";
import {
  logger
} from "./chunk-THZKQPHU.js";
import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  jobDurationSeconds,
  jobsTotal,
  register
} from "./chunk-Q4Q4AQL5.js";
import "./chunk-MLKGABMK.js";

// src/observability/middleware.ts
import { createMiddleware } from "@tanstack/react-start";
function tryGetRoute(result, fallback) {
  try {
    const r = result;
    if (r?.context?.matchedRouteId) return r.context.matchedRouteId;
  } catch {
  }
  return fallback;
}
var loggingMiddleware = createMiddleware({ type: "request" }).server(
  async ({ next, request, pathname }) => {
    const { logger: logger2 } = await import("./logger-YEK7GN4X.js");
    const { httpRequestsTotal: httpRequestsTotal2, httpRequestDurationSeconds: httpRequestDurationSeconds2 } = await import("./metrics-GILTHZM7.js");
    const start = process.hrtime.bigint();
    const method = request.method;
    try {
      const result = await next();
      const duration = Number(process.hrtime.bigint() - start) / 1e9;
      const status = result.response.status;
      const route = tryGetRoute(result, "unknown");
      httpRequestsTotal2.inc({ method, route, status });
      httpRequestDurationSeconds2.observe({ method, route, status }, duration);
      logger2.info(
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
      httpRequestsTotal2.inc({ method, route: "unknown", status: 500 });
      httpRequestDurationSeconds2.observe(
        { method, route: "unknown", status: 500 },
        duration
      );
      logger2.error(
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
export {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  isAllowed,
  isLocalNetworkIp,
  jobDurationSeconds,
  jobsTotal,
  logger,
  loggingMiddleware,
  register
};
