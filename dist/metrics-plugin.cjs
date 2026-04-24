"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkT6TROFNRcjs = require('./chunk-T6TROFNR.cjs');


var _chunkZFR3HIOOcjs = require('./chunk-ZFR3HIOO.cjs');


var _chunkZZK7GFOCcjs = require('./chunk-ZZK7GFOC.cjs');
require('./chunk-75ZPJI57.cjs');

// src/observability/metrics-plugin.ts
var _nitro = require('nitro');
function clientIp(event) {
  const xff = event.req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xreal = event.req.headers.get("x-real-ip");
  if (xreal) return xreal.trim();
  const peer = _optionalChain([event, 'access', _ => _.runtime, 'optionalAccess', _2 => _2.node, 'optionalAccess', _3 => _3.req, 'optionalAccess', _4 => _4.socket, 'optionalAccess', _5 => _5.remoteAddress]);
  if (peer) return peer.replace(/^::ffff:/, "");
  return "127.0.0.1";
}
var metrics_plugin_default = _nitro.definePlugin.call(void 0, (nitro) => {
  const allowlist = (_nullishCoalesce(process.env.METRICS_ALLOWED_IPS, () => ( ""))).split(",").map((s) => s.trim()).filter(Boolean);
  nitro.hooks.hook("request", async (event) => {
    const req = event.req;
    if (req.method !== "GET") return;
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname !== "/metrics") return;
    const ip = clientIp(event);
    if (!_chunkT6TROFNRcjs.isAllowed.call(void 0, ip, allowlist)) {
      _chunkZFR3HIOOcjs.logger.warn({ ip }, "metrics_access_denied");
      throw new (0, _nitro.HTTPResponse)("forbidden", { status: 403 });
    }
    const body = await _chunkZZK7GFOCcjs.register.metrics();
    throw new (0, _nitro.HTTPResponse)(body, {
      status: 200,
      headers: { "Content-Type": _chunkZZK7GFOCcjs.register.contentType }
    });
  });
});


exports.default = metrics_plugin_default;
