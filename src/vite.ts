import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { createRequire } from "node:module";
import path from "path";
import type { PluginOption, UserConfig } from "vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Resolve @naps62/start/metrics-plugin to an absolute file path at config
// time — Nitro's plugin loader expects filesystem paths, not package
// specifiers. createRequire from this module's URL resolves through the
// consuming app's node_modules, where @naps62/start lives.
const requireFromHere = createRequire(import.meta.url);
function resolveMetricsPlugin(): string | null {
  try {
    return requireFromHere.resolve("@naps62/start/metrics-plugin");
  } catch {
    return null;
  }
}

export interface StartViteConfig {
  vite?: Omit<UserConfig, "plugins">;
  observability?: boolean;
}

export function createViteConfig(options: StartViteConfig = {}) {
  const { vite: userConfig = {}, observability: observabilityOpt } = options;
  const observability = observabilityOpt !== false;

  return defineConfig({
    ...userConfig,
    resolve: {
      ...userConfig.resolve,
      alias: [
        {
          find: /^@naps62\/start\/(.+)$/,
          replacement: path.resolve(
            "./node_modules/@naps62/start/dist/$1.js",
          ),
        },
        {
          find: "@naps62/start",
          replacement: path.resolve(
            "./node_modules/@naps62/start/dist/index.js",
          ),
        },
        ...(Array.isArray(userConfig.resolve?.alias)
          ? userConfig.resolve.alias
          : Object.entries(userConfig.resolve?.alias ?? {}).map(
              ([find, replacement]) => ({ find, replacement: replacement as string }),
            )),
      ],
    },
    server: {
      host: "0.0.0.0",
      port: 3000,
      allowedHosts: true,
      ...userConfig.server,
    },
    optimizeDeps: {
      exclude: [
        ...(userConfig.optimizeDeps?.exclude ?? []),
      ],
    },
    ssr: {
      external: [
        ...(userConfig.ssr?.external as string[] ?? []),
      ],
    },
    plugins: [
      nitro({
        plugins: (() => {
          if (!observability) return [];
          const resolved = resolveMetricsPlugin();
          return resolved ? [resolved] : [];
        })(),
        rollupConfig: {
          external: (id: string) => id.endsWith(".node"),
        },
      }),
      viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ] as PluginOption[],
  });
}
