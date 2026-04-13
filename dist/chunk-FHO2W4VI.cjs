"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkKGHFZP22cjs = require('./chunk-KGHFZP22.cjs');

// src/root.tsx



var _reactrouter = require('@tanstack/react-router');





var _jsxruntime = require('react/jsx-runtime');
function RootDocument({ children }) {
  return /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "html", { lang: "en", className: "dark", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "head", { children: [
      /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _reactrouter.HeadContent, {}),
      /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
        "script",
        {
          dangerouslySetInnerHTML: {
            __html: _chunkKGHFZP22cjs.getThemeInitScript.call(void 0, )
          }
        }
      )
    ] }),
    /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "body", { className: "bg-background text-foreground min-h-dvh antialiased", children: [
      children,
      /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _reactrouter.Scripts, {})
    ] })
  ] });
}
function AuthGuard({
  user,
  loginPath = "/login",
  children
}) {
  const { location } = _reactrouter.useRouterState.call(void 0, );
  const isLoginPage = location.pathname === loginPath;
  if (!user && !isLoginPage) {
    return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _reactrouter.Navigate, { to: loginPath });
  }
  if (!user) {
    return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _reactrouter.Outlet, {});
  }
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _jsxruntime.Fragment, { children });
}
function RootErrorComponent({ error, reset }) {
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { className: "flex min-h-dvh items-center justify-center bg-background px-4", children: /* @__PURE__ */ _jsxruntime.jsxs.call(void 0, "div", { className: "max-w-md space-y-4 text-center", children: [
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "h1", { className: "text-2xl font-semibold text-foreground", children: "Something went wrong" }),
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "p", { className: "text-sm text-muted-foreground", children: error instanceof Error ? error.message : "An unexpected error occurred." }),
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
      "button",
      {
        onClick: reset,
        className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors",
        children: "Try again"
      }
    )
  ] }) });
}





exports.RootDocument = RootDocument; exports.AuthGuard = AuthGuard; exports.RootErrorComponent = RootErrorComponent;
