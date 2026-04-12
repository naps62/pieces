// src/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index,
  check
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
var llmJobs = pgTable(
  "llm_jobs",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    prompt: text("prompt").notNull(),
    status: text("status").notNull().default("pending"),
    log: text("log").notNull().default(""),
    exitCode: integer("exit_code"),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    index("idx_llm_jobs_status").on(t.status),
    index("idx_llm_jobs_created").on(t.createdAt),
    check("llm_jobs_status_check", sql`${t.status} IN ('pending','running','success','failed')`)
  ]
);

export {
  llmJobs
};
