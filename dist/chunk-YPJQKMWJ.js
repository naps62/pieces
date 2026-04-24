// src/observability/logger.ts
import pino from "pino";
var isDev = process.env.NODE_ENV !== "production";
var options = {
  level: process.env.LOG_LEVEL ?? (isDev ? "debug" : "info"),
  formatters: {
    level: (label) => ({ level: label })
  },
  messageKey: "message",
  timestamp: () => `,"timestamp":"${(/* @__PURE__ */ new Date()).toISOString()}"`,
  base: {
    service: process.env.SERVICE_NAME ?? "app",
    env: process.env.NODE_ENV ?? "development"
  },
  ...isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "HH:MM:ss.l" }
    }
  },
  redact: {
    paths: [
      "*.password",
      "*.token",
      "*.secret",
      "*.authorization",
      "*.cookie",
      "req.headers.authorization",
      "req.headers.cookie"
    ],
    censor: "[redacted]"
  }
};
var logger = isDev ? pino(options) : pino(options, process.stdout);

// src/observability/metrics.ts
import { collectDefaultMetrics, Counter, Histogram, register } from "prom-client";
if (!register.getSingleMetric("nodejs_version_info")) {
  collectDefaultMetrics();
}
var httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"]
});
var httpRequestDurationSeconds = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [1e-3, 5e-3, 0.01, 0.05, 0.1, 0.5, 1, 5]
});
var jobsTotal = new Counter({
  name: "jobs_total",
  help: "Total pg-boss jobs processed",
  labelNames: ["job", "status"]
});
var jobDurationSeconds = new Histogram({
  name: "job_duration_seconds",
  help: "pg-boss job duration in seconds",
  labelNames: ["job", "status"],
  buckets: [0.1, 0.5, 1, 5, 30, 60, 300, 600, 1800]
});

// src/observability/ip-access.ts
import { isIP } from "net";
var PRIVATE_CIDRS = [
  [2130706432, 8],
  // 127.0.0.0/8
  [167772160, 8],
  // 10.0.0.0/8
  [2886729728, 12],
  // 172.16.0.0/12
  [3232235520, 16]
  // 192.168.0.0/16
];
function ipv4ToInt(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8 | v) >>> 0;
  }
  return n;
}
function isLocalNetworkIp(ip) {
  if (!ip) return false;
  if (ip === "::1") return true;
  const clean = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
  if (!isIP(clean)) return false;
  const n = ipv4ToInt(clean);
  if (n === null) return false;
  return PRIVATE_CIDRS.some(
    ([base, bits]) => n >>> 32 - bits === base >>> 32 - bits
  );
}
function isAllowed(ip, allowlist) {
  if (allowlist.length === 0) return isLocalNetworkIp(ip);
  return allowlist.includes(ip);
}

export {
  logger,
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  jobsTotal,
  jobDurationSeconds,
  isLocalNetworkIp,
  isAllowed
};
