"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/schema.ts








var _pgcore = require('drizzle-orm/pg-core');
var _drizzleorm = require('drizzle-orm');
var llmJobs = _pgcore.pgTable.call(void 0, 
  "llm_jobs",
  {
    id: _pgcore.serial.call(void 0, "id").primaryKey(),
    name: _pgcore.text.call(void 0, "name").notNull(),
    prompt: _pgcore.text.call(void 0, "prompt").notNull(),
    status: _pgcore.text.call(void 0, "status").notNull().default("pending"),
    log: _pgcore.text.call(void 0, "log").notNull().default(""),
    exitCode: _pgcore.integer.call(void 0, "exit_code"),
    error: _pgcore.text.call(void 0, "error"),
    startedAt: _pgcore.timestamp.call(void 0, "started_at", { withTimezone: true }),
    finishedAt: _pgcore.timestamp.call(void 0, "finished_at", { withTimezone: true }),
    createdAt: _pgcore.timestamp.call(void 0, "created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    _pgcore.index.call(void 0, "idx_llm_jobs_status").on(t.status),
    _pgcore.index.call(void 0, "idx_llm_jobs_created").on(t.createdAt),
    _pgcore.check.call(void 0, "llm_jobs_status_check", _drizzleorm.sql`${t.status} IN ('pending','running','success','failed')`)
  ]
);



exports.llmJobs = llmJobs;
