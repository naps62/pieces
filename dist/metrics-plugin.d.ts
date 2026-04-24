import * as nitro_types from 'nitro/types';
import { Server } from 'node:http';

declare global {
    var __metricsServer: Server | undefined;
}
declare const _default: nitro_types.NitroAppPlugin;

export { _default as default };
