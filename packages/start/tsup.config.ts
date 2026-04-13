import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    vite: "src/vite.ts",
    "entry-client": "src/entry-client.tsx",
    router: "src/router.ts",
    auth: "src/auth.ts",
    schema: "src/schema.ts",
    // root: "src/root.tsx",         // added in Task 7
  },
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  splitting: true,
  external: [
    "react",
    "react-dom",
    "vite",
    "drizzle-orm",
    "@naps62/ui",
    "@tailwindcss/vite",
    "@vitejs/plugin-react",
    "vite-tsconfig-paths",
    "nitro",
    "@tanstack/react-router",
    "@tanstack/react-start",
    "bcryptjs",
    "postgres",
    "drizzle-orm/pg-core",
  ],
});
