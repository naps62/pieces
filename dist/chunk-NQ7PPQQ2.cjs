"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/vite.ts
var _vite = require('@tailwindcss/vite'); var _vite2 = _interopRequireDefault(_vite);
var _vite3 = require('@tanstack/react-start/plugin/vite');
var _pluginreact = require('@vitejs/plugin-react'); var _pluginreact2 = _interopRequireDefault(_pluginreact);
var _vite5 = require('nitro/vite');
var _module = require('module');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _vite7 = require('vite');
var _vitetsconfigpaths = require('vite-tsconfig-paths'); var _vitetsconfigpaths2 = _interopRequireDefault(_vitetsconfigpaths);
var requireFromHere = _module.createRequire.call(void 0, import.meta.url);
function resolveMetricsPlugin() {
  try {
    return requireFromHere.resolve("@naps62/start/metrics-plugin");
  } catch (e) {
    return null;
  }
}
function createViteConfig(options = {}) {
  const { vite: userConfig = {}, observability: observabilityOpt } = options;
  const observability = observabilityOpt !== false;
  return _vite7.defineConfig.call(void 0, {
    ...userConfig,
    resolve: {
      ...userConfig.resolve,
      alias: [
        {
          find: /^@naps62\/start\/(.+)$/,
          replacement: _path2.default.resolve(
            "./node_modules/@naps62/start/dist/$1.js"
          )
        },
        {
          find: "@naps62/start",
          replacement: _path2.default.resolve(
            "./node_modules/@naps62/start/dist/index.js"
          )
        },
        ...Array.isArray(_optionalChain([userConfig, 'access', _ => _.resolve, 'optionalAccess', _2 => _2.alias])) ? userConfig.resolve.alias : Object.entries(_nullishCoalesce(_optionalChain([userConfig, 'access', _3 => _3.resolve, 'optionalAccess', _4 => _4.alias]), () => ( {}))).map(
          ([find, replacement]) => ({ find, replacement })
        )
      ]
    },
    server: {
      host: "0.0.0.0",
      port: 3e3,
      allowedHosts: true,
      ...userConfig.server
    },
    optimizeDeps: {
      exclude: [
        ..._nullishCoalesce(_optionalChain([userConfig, 'access', _5 => _5.optimizeDeps, 'optionalAccess', _6 => _6.exclude]), () => ( []))
      ]
    },
    ssr: {
      external: [
        ..._nullishCoalesce(_optionalChain([userConfig, 'access', _7 => _7.ssr, 'optionalAccess', _8 => _8.external]), () => ( []))
      ]
    },
    plugins: [
      _vite5.nitro.call(void 0, {
        plugins: (() => {
          if (!observability) return [];
          const resolved = resolveMetricsPlugin();
          return resolved ? [resolved] : [];
        })(),
        rollupConfig: {
          external: (id) => id.endsWith(".node")
        }
      }),
      _vitetsconfigpaths2.default.call(void 0, { projects: ["./tsconfig.json"] }),
      _vite2.default.call(void 0, ),
      _vite3.tanstackStart.call(void 0, ),
      _pluginreact2.default.call(void 0, )
    ]
  });
}



exports.createViteConfig = createViteConfig;
