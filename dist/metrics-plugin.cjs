"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }

var _chunkT6TROFNRcjs = require('./chunk-T6TROFNR.cjs');



var _chunkNNHGSWKOcjs = require('./chunk-NNHGSWKO.cjs');
require('./chunk-75ZPJI57.cjs');

// src/observability/metrics-plugin.ts
var _http = require('http');
var _nitro = require('nitro');
var metrics_plugin_default = _nitro.definePlugin.call(void 0, () => {
  if (globalThis.__metricsServer) return;
  const port = Number(process.env.METRICS_PORT) || 9e3;
  const allowlist = (_nullishCoalesce(process.env.METRICS_ALLOWED_IPS, () => ( ""))).split(",").map((s) => s.trim()).filter(Boolean);
  const server = _http.createServer.call(void 0, async (req, res) => {
    const ip = (_nullishCoalesce(req.socket.remoteAddress, () => ( ""))).replace(/^::ffff:/, "");
    if (!_chunkT6TROFNRcjs.isAllowed.call(void 0, ip, allowlist)) {
      res.writeHead(403).end("forbidden");
      _chunkNNHGSWKOcjs.logger.warn({ ip, path: req.url }, "metrics_access_denied");
      return;
    }
    if (req.url === "/metrics" && req.method === "GET") {
      const body = await _chunkNNHGSWKOcjs.register.metrics();
      res.writeHead(200, { "Content-Type": _chunkNNHGSWKOcjs.register.contentType }).end(body);
      return;
    }
    res.writeHead(404).end("not found");
  });
  server.listen(port, "0.0.0.0", () => {
    _chunkNNHGSWKOcjs.logger.info({ port }, "metrics_server_listening");
  });
  server.on("error", (err) => {
    _chunkNNHGSWKOcjs.logger.error({ err: err.message }, "metrics_server_error");
  });
  globalThis.__metricsServer = server;
});


exports.default = metrics_plugin_default;
