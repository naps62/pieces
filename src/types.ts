export interface SshConfig {
  host: string;
  privateKey?: string;
  repoPath: string;
}

export interface RunnerConfig {
  databaseUrl: string;
  ssh: SshConfig;
  logFlushIntervalMs?: number;
}

export interface EnqueueOptions {
  name: string;
  prompt: string;
}

export interface ScheduleOptions {
  name: string;
  prompt: string;
  cron: string;
}

export interface ListOptions {
  limit?: number;
}
