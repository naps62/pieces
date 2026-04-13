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
      alias: {
        "@naps62/ui": path.resolve(
          "./node_modules/@naps62/ui/packages/ui/dist/index.js"
        ),
        ...userConfig.resolve?.alias
      }
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
