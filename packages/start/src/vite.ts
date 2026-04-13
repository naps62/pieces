import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import path from "path";
import type { PluginOption, UserConfig } from "vite";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

export interface StartViteConfig {
  vite?: Omit<UserConfig, "plugins">;
}

export function createViteConfig(options: StartViteConfig = {}) {
  const { vite: userConfig = {} } = options;

  return defineConfig({
    ...userConfig,
    resolve: {
      ...userConfig.resolve,
      alias: [
        {
          find: /^@naps62\/start\/(.+)$/,
          replacement: path.resolve(
            "./node_modules/@naps62/start/packages/start/dist/$1.js",
          ),
        },
        {
          find: "@naps62/start",
          replacement: path.resolve(
            "./node_modules/@naps62/start/packages/start/dist/index.js",
          ),
        },
        {
          find: "@naps62/ui",
          replacement: path.resolve(
            "./node_modules/@naps62/ui/packages/ui/dist/index.js",
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
