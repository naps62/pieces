import {
  isAllowed
} from "./chunk-LKINEZ23.js";
import {
  logger,
  register
} from "./chunk-YGN6LMXH.js";
import "./chunk-MLKGABMK.js";

// src/observability/metrics-plugin.ts
import { definePlugin as defineNitroPlugin, HTTPResponse } from "nitro";
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
    const pathname = new URL(req.url).pathname;
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
