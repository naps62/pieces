import { definePlugin as defineNitroPlugin, HTTPResponse } from "nitro";
import { register } from "./metrics";
import { logger } from "./logger";
import { isAllowed } from "./ip-access";

// Prefer X-Forwarded-For (proxies set this with the real client IP), then
// X-Real-IP, then the raw socket peer from the Node runtime. Falls back to
// "127.0.0.1" so that direct connections without proxy headers (e.g. local
// dev, Prometheus on the same host) pass the RFC1918 default allowlist.
function clientIp(event: {
  req: Request;
  runtime?: { node?: { req?: { socket?: { remoteAddress?: string } } } };
}): string {
  const xff = event.req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const xreal = event.req.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  const peer = event.runtime?.node?.req?.socket?.remoteAddress;
  if (peer) return peer.replace(/^::ffff:/, "");
  return "127.0.0.1";
}

export default defineNitroPlugin((nitro) => {
  const allowlist = (process.env.METRICS_ALLOWED_IPS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  nitro.hooks.hook("request", async (event) => {
    const req = event.req;
    if (req.method !== "GET") return;
    // req.url may be absolute or relative depending on runtime — normalize.
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
      headers: { "Content-Type": register.contentType },
    });
  });
});
