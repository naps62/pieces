import {
  isAllowed
} from "./chunk-LKINEZ23.js";
import {
  logger,
  register
} from "./chunk-YGN6LMXH.js";
import "./chunk-MLKGABMK.js";

// src/observability/metrics-plugin.ts
import { createServer } from "http";
import { definePlugin as defineNitroPlugin } from "nitro";
var metrics_plugin_default = defineNitroPlugin(() => {
  if (globalThis.__metricsServer) return;
  const port = Number(process.env.METRICS_PORT) || 9e3;
  const allowlist = (process.env.METRICS_ALLOWED_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const server = createServer(async (req, res) => {
    const ip = (req.socket.remoteAddress ?? "").replace(/^::ffff:/, "");
    if (!isAllowed(ip, allowlist)) {
      res.writeHead(403).end("forbidden");
      logger.warn({ ip, path: req.url }, "metrics_access_denied");
      return;
    }
    if (req.url === "/metrics" && req.method === "GET") {
      const body = await register.metrics();
      res.writeHead(200, { "Content-Type": register.contentType }).end(body);
      return;
    }
    res.writeHead(404).end("not found");
  });
  server.listen(port, "0.0.0.0", () => {
    logger.info({ port }, "metrics_server_listening");
  });
  server.on("error", (err) => {
    logger.error({ err: err.message }, "metrics_server_error");
  });
  globalThis.__metricsServer = server;
});
export {
  metrics_plugin_default as default
};
