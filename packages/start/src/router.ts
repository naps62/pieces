import { createRouter } from "@tanstack/react-router";
import type { AnyRoute } from "@tanstack/react-router";

export function createAppRouter<TRouteTree extends AnyRoute>({
  routeTree,
}: {
  routeTree: TRouteTree;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createRouter({
    routeTree,
    scrollRestoration: true,
  } as any);
}
