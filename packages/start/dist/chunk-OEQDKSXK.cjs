"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk75ZPJI57cjs = require('./chunk-75ZPJI57.cjs');

// src/schema.ts
var schema_exports = {};
_chunk75ZPJI57cjs.__export.call(void 0, schema_exports, {
  sessions: () => sessions,
  users: () => users
});







var _pgcore = require('drizzle-orm/pg-core');
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





exports.users = users; exports.sessions = sessions; exports.schema_exports = schema_exports;
