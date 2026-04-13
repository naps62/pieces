// src/entry-client.tsx
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { jsx } from "react/jsx-runtime";
startTransition(() => {
  hydrateRoot(
    document,
    /* @__PURE__ */ jsx(StrictMode, { children: /* @__PURE__ */ jsx(StartClient, {}) })
  );
});
