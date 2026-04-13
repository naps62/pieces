"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk75ZPJI57cjs = require('./chunk-75ZPJI57.cjs');

// src/schema.ts
var schema_exports = {};
_chunk75ZPJI57cjs.__export.call(void 0, schema_exports, {
  llmJobs: () => llmJobs,
  sessions: () => sessions,
  users: () => users
});








var _pgcore = require('drizzle-orm/pg-core');
var _drizzleorm = require('drizzle-orm');
var users = _pgcore.pgTable.call(void 0, "users", {
  id: _pgcore.serial.call(void 0, "id").primaryKey(),
  username: _pgcore.text.call(void 0, "username").notNull().unique(),
  password_hash: _pgcore.text.call(void 0, "password_hash").notNull(),
  created_at: _pgcore.timestamp.call(void 0, "created_at", { withTimezone: true }).defaultNow().notNull()
});
var sessions = _pgcore.pgTable.call(void 0, 
  "sessions",
  {
    id: _pgcore.serial.call(void 0, "id").primaryKey(),
    user_id: _pgcore.integer.call(void 0, "user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: _pgcore.text.call(void 0, "token").notNull().unique(),
    expires_at: _pgcore.timestamp.call(void 0, "expires_at", { withTimezone: true }).notNull(),
    created_at: _pgcore.timestamp.call(void 0, "created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (t) => [
    _pgcore.index.call(void 0, "idx_sessions_token").on(t.token),
    _pgcore.index.call(void 0, "idx_sessions_expires").on(t.expires_at)
  ]
);
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






exports.users = users; exports.sessions = sessions; exports.llmJobs = llmJobs; exports.schema_exports = schema_exports;
