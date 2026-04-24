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

export {
  logger,
  register,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  jobsTotal,
  jobDurationSeconds
};
