import PgBoss from "pg-boss";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, desc, sql as dsql } from "drizzle-orm";
import { llmJobs } from "./schema";
import { executeSshJob } from "./ssh";
import type {
  RunnerConfig,
  EnqueueOptions,
  ScheduleOptions,
  ListOptions,
} from "./types";
import type { LlmJob } from "./schema";

const QUEUE_NAME = "llm-job";

export interface JobRunner {
  start(): Promise<void>;
  stop(): Promise<void>;
  enqueue(options: EnqueueOptions): Promise<number>;
  schedule(options: ScheduleOptions): Promise<void>;
  getJob(id: number): Promise<LlmJob | null>;
  listJobs(options?: ListOptions): Promise<LlmJob[]>;
}

export function createJobRunner(config: RunnerConfig): JobRunner {
  const flushInterval = config.logFlushIntervalMs ?? 1500;
  const boss = new PgBoss({ connectionString: config.databaseUrl });
  const pgClient = postgres(config.databaseUrl, { max: 3 });
  const db = drizzle(pgClient);

  boss.on("error", (err) => console.error("[llm-job-runner] pg-boss error:", err));

  async function processJob(pgBossJob: PgBoss.Job<{ jobId: number; prompt: string }>) {
    const { jobId, prompt } = pgBossJob.data;

    await db
      .update(llmJobs)
      .set({ status: "running", startedAt: new Date() })
      .where(eq(llmJobs.id, jobId));

    let buffer = "";
    let lastFlush = Date.now();

    const flush = async () => {
      if (buffer.length === 0) return;
      const pending = buffer;
      buffer = "";
      lastFlush = Date.now();
      await db
        .update(llmJobs)
        .set({ log: dsql`${llmJobs.log} || ${pending}` })
        .where(eq(llmJobs.id, jobId));
    };

    await executeSshJob(config.ssh, prompt, {
      onChunk: async (chunk) => {
        buffer += chunk;
        if (Date.now() - lastFlush > flushInterval) {
          await flush();
        }
      },
      onDone: async (exitCode, error) => {
        await flush();
        await db
          .update(llmJobs)
          .set({
            status: exitCode === 0 ? "success" : "failed",
            exitCode: exitCode ?? null,
            error: error ?? null,
            finishedAt: new Date(),
          })
          .where(eq(llmJobs.id, jobId));
      },
    });
  }

  return {
    async start() {
      await boss.start();
      await boss.createQueue(QUEUE_NAME);
      await boss.work<{ jobId: number; prompt: string }>(QUEUE_NAME, async ([job]) => {
        await processJob(job);
      });
    },

    async stop() {
      await boss.stop();
      await pgClient.end();
    },

    async enqueue(options: EnqueueOptions): Promise<number> {
      const [row] = await db
        .insert(llmJobs)
        .values({
          name: options.name,
          prompt: options.prompt,
          status: "pending",
        })
        .returning({ id: llmJobs.id });

      await boss.send(QUEUE_NAME, {
        jobId: row.id,
        prompt: options.prompt,
      });

      return row.id;
    },

    async schedule(options: ScheduleOptions): Promise<void> {
      const scheduleName = `llm-schedule-${options.name}`;
      await boss.schedule(scheduleName, options.cron, {
        name: options.name,
        prompt: options.prompt,
      });
      // Register a worker for the schedule queue if not already done.
      // pg-boss schedules send to a queue with the schedule name.
      await boss.createQueue(scheduleName);
      await boss.work<{ name: string; prompt: string }>(scheduleName, async ([job]) => {
        // Cron-fired job: create the llm_jobs row, then process
        const [row] = await db
          .insert(llmJobs)
          .values({
            name: job.data.name,
            prompt: job.data.prompt,
            status: "pending",
          })
          .returning();

        await processJob({
          ...job,
          data: { jobId: row.id, prompt: job.data.prompt },
        });
      });
    },

    async getJob(id: number): Promise<LlmJob | null> {
      const rows = await db
        .select()
        .from(llmJobs)
        .where(eq(llmJobs.id, id))
        .limit(1);
      return rows[0] ?? null;
    },

    async listJobs(options?: ListOptions): Promise<LlmJob[]> {
      return db
        .select()
        .from(llmJobs)
        .orderBy(desc(llmJobs.createdAt))
        .limit(options?.limit ?? 50);
    },
  };
}
