import {
  logger
} from "./chunk-THZKQPHU.js";
import {
  register
} from "./chunk-Q4Q4AQL5.js";
import "./chunk-MLKGABMK.js";

// src/observability/metrics-plugin.ts
import { definePlugin as defineNitroPlugin, HTTPResponse } from "nitro";

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

// src/observability/metrics-plugin.ts
function clientIp(event) {
  const xff = event.req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xreal = event.req.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  const peer = event.runtime?.node?.req?.socket?.remoteAddress;
  if (peer) return peer.replace(/^::ffff:/, "");
  return "127.0.0.1";
}
var metrics_plugin_default = defineNitroPlugin((nitro) => {
  const allowlist = (process.env.METRICS_ALLOWED_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  nitro.hooks.hook("request", async (event) => {
    const req = event.req;
    if (req.method !== "GET") return;
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname !== "/metrics") return;
    const ip = clientIp(event);
    if (!isAllowed(ip, allowlist)) {
      logger.warn({ ip }, "metrics_access_denied");
      throw new HTTPResponse("forbidden", { status: 403 });
    }
    const body = await register.metrics();
    throw new HTTPResponse(body, {
      status: 200,
      headers: { "Content-Type": register.contentType }
    });
  });
});
export {
  metrics_plugin_default as default
};
