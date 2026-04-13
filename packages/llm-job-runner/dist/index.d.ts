import { LlmJob } from './schema.js';
export { llmJobs } from './schema.js';
import 'drizzle-orm/pg-core';

interface SshConfig {
    host: string;
    privateKey?: string;
    repoPath: string;
}
interface RunnerConfig {
    databaseUrl: string;
    ssh: SshConfig;
    logFlushIntervalMs?: number;
}
interface EnqueueOptions {
    name: string;
    prompt: string;
}
interface ScheduleOptions {
    name: string;
    prompt: string;
    cron: string;
}
interface ListOptions {
    limit?: number;
}

interface JobRunner {
    start(): Promise<void>;
    stop(): Promise<void>;
    enqueue(options: EnqueueOptions): Promise<number>;
    schedule(options: ScheduleOptions): Promise<void>;
    getJob(id: number): Promise<LlmJob | null>;
    listJobs(options?: ListOptions): Promise<LlmJob[]>;
}
declare function createJobRunner(config: RunnerConfig): JobRunner;

export { type EnqueueOptions, type JobRunner, type ListOptions, LlmJob, type RunnerConfig, type ScheduleOptions, type SshConfig, createJobRunner };
