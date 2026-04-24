"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

var _chunkZFR3HIOOcjs = require('./chunk-ZFR3HIOO.cjs');


var _chunkZZK7GFOCcjs = require('./chunk-ZZK7GFOC.cjs');
require('./chunk-75ZPJI57.cjs');

// src/observability/metrics-plugin.ts
var _nitro = require('nitro');

// src/observability/ip-access.ts
var _net = require('net');
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
  if (!_net.isIP.call(void 0, clean)) return false;
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
    if (!isAllowed(ip, allowlist)) {
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
