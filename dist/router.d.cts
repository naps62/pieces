import * as _tanstack_router_core from '@tanstack/router-core';
import * as _tanstack_history from '@tanstack/history';
import { AnyRoute } from '@tanstack/react-router';

declare function createAppRouter<TRouteTree extends AnyRoute>({ routeTree, }: {
    routeTree: TRouteTree;
}): _tanstack_router_core.RouterCore<AnyRoute, "never", false, _tanstack_history.RouterHistory, Record<string, any>>;

export { createAppRouter };
