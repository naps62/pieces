import {
  __export
} from "./chunk-MLKGABMK.js";

// src/schema.ts
var schema_exports = {};
__export(schema_exports, {
  llmJobs: () => llmJobs,
  sessions: () => sessions,
  users: () => users
});
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
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password_hash: text("password_hash").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
});
var sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    index("idx_sessions_token").on(t.token),
    index("idx_sessions_expires").on(t.expires_at)
  ]
);
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
  users,
  sessions,
  llmJobs,
  schema_exports
};
