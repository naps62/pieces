// src/router.ts
import { createRouter } from "@tanstack/react-router";
function createAppRouter({
  routeTree
}) {
  return createRouter({
    routeTree,
    scrollRestoration: true
  });
}

export {
  createAppRouter
};
