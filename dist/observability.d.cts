import pino from 'pino';
import { Histogram, Counter } from 'prom-client';
export { register } from 'prom-client';
import * as _tanstack_react_start from '@tanstack/react-start';

declare const logger: pino.Logger<never, boolean>;
type Logger = typeof logger;

declare const httpRequestsTotal: Counter<"status" | "method" | "route">;
declare const httpRequestDurationSeconds: Histogram<"status" | "method" | "route">;
declare const jobsTotal: Counter<"status" | "job">;
declare const jobDurationSeconds: Histogram<"status" | "job">;

declare const loggingMiddleware: _tanstack_react_start.RequestMiddlewareAfterServer<{}, undefined, undefined>;

declare function isLocalNetworkIp(ip: string): boolean;
declare function isAllowed(ip: string, allowlist: string[]): boolean;

export { type Logger, httpRequestDurationSeconds, httpRequestsTotal, isAllowed, isLocalNetworkIp, jobDurationSeconds, jobsTotal, logger, loggingMiddleware };
