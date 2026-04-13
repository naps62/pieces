// src/schema.ts
import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  index
} from "drizzle-orm/pg-core";
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
export {
  sessions,
  users
};
