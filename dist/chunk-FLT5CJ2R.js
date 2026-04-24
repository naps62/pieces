// src/vite.ts
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import path from "path";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
function createViteConfig(options = {}) {
  const { vite: userConfig = {} } = options;
  return defineConfig({
    ...userConfig,
    resolve: {
      ...userConfig.resolve,
      alias: [
        {
          find: /^@naps62\/start\/(.+)$/,
          replacement: path.resolve(
            "./node_modules/@naps62/start/dist/$1.js"
          )
        },
        {
          find: "@naps62/start",
          replacement: path.resolve(
            "./node_modules/@naps62/start/dist/index.js"
          )
        },
        ...Array.isArray(userConfig.resolve?.alias) ? userConfig.resolve.alias : Object.entries(userConfig.resolve?.alias ?? {}).map(
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
        ...userConfig.optimizeDeps?.exclude ?? []
      ]
    },
    ssr: {
      external: [
        ...userConfig.ssr?.external ?? []
      ]
    },
    plugins: [
      nitro({
        rollupConfig: {
          external: (id) => id.endsWith(".node")
        }
      }),
      viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
      tailwindcss(),
      tanstackStart(),
      viteReact()
    ]
  });
}

export {
  createViteConfig
};
