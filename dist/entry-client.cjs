"use strict";// src/entry-client.tsx
var _client = require('@tanstack/react-start/client');
var _react = require('react');
var _client3 = require('react-dom/client');
var _jsxruntime = require('react/jsx-runtime');
_react.startTransition.call(void 0, () => {
  _client3.hydrateRoot.call(void 0, 
    document,
    /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _react.StrictMode, { children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, _client.StartClient, {}) })
  );
});
