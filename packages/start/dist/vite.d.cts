import { UserConfig } from 'vite';

interface StartViteConfig {
    vite?: Omit<UserConfig, "plugins">;
}
declare function createViteConfig(options?: StartViteConfig): UserConfig;

export { type StartViteConfig, createViteConfig };
