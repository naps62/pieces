// src/root.tsx
import {
  HeadContent,
  Scripts
} from "@tanstack/react-router";
import {
  Navigate,
  Outlet,
  useRouterState
} from "@tanstack/react-router";
import { getThemeInitScript } from "@naps62/ui";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function RootDocument({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", className: "dark", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxs("head", { children: [
      /* @__PURE__ */ jsx(HeadContent, {}),
      /* @__PURE__ */ jsx(
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: getThemeInitScript()
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("body", { className: "bg-background text-foreground min-h-dvh antialiased", children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function AuthGuard({
  user,
  loginPath = "/login",
  children
}) {
  const { location } = useRouterState();
  const isLoginPage = location.pathname === loginPath;
  if (!user && !isLoginPage) {
    return /* @__PURE__ */ jsx(Navigate, { to: loginPath });
  }
  if (!user) {
    return /* @__PURE__ */ jsx(Outlet, {});
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
function RootErrorComponent({ error, reset }) {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-dvh items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md space-y-4 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: error instanceof Error ? error.message : "An unexpected error occurred." }),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: reset,
        className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors",
        children: "Try again"
      }
    )
  ] }) });
}

export {
  RootDocument,
  AuthGuard,
  RootErrorComponent
};
