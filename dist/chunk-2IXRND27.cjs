"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/router.ts
var _reactrouter = require('@tanstack/react-router');
function createAppRouter({
  routeTree
}) {
  return _reactrouter.createRouter.call(void 0, {
    routeTree,
    scrollRestoration: true
  });
}



exports.createAppRouter = createAppRouter;
