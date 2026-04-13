import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    // vite: "src/vite.ts",          // added in Task 2
    // "entry-client": "src/entry-client.tsx", // added in Task 3
    // router: "src/router.ts",      // added in Task 4
    // auth: "src/auth.ts",          // added in Task 6
    // schema: "src/schema.ts",      // added in Task 5
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
