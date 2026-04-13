import {
  schema_exports,
  sessions,
  users
} from "./chunk-H3OSWIAU.js";

// src/auth.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  getCookie,
  setCookie,
  deleteCookie
} from "@tanstack/react-start/server";
var SESSION_COOKIE = "session_token";
var SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1e3;
var BCRYPT_ROUNDS = 12;
function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return drizzle(postgres(connectionString, { max: 5 }), { schema: schema_exports });
}
var _db = null;
function db() {
  if (!_db) _db = getDb();
  return _db;
}
async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
async function createSession(userId) {
  const token = globalThis.crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db().insert(sessions).values({
    user_id: userId,
    token,
    expires_at: expiresAt
  });
  return token;
}
async function validateSession(token) {
  const [session] = await db().select({
    userId: sessions.user_id,
    username: users.username,
    expiresAt: sessions.expires_at
  }).from(sessions).innerJoin(users, eq(sessions.user_id, users.id)).where(
    and(
      eq(sessions.token, token),
      gt(sessions.expires_at, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!session) return null;
  return { userId: session.userId, username: session.username };
}
async function deleteSession(token) {
  await db().delete(sessions).where(eq(sessions.token, token));
}
function getSessionToken() {
  return getCookie(SESSION_COOKIE);
}
function setSessionCookie(token) {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1e3)
  });
}
function clearSessionCookie() {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}
async function getCurrentUser() {
  const token = getSessionToken();
  if (!token) return null;
  return validateSession(token);
}
async function ensureDefaultUser() {
  const existing = await db().select({ id: users.id }).from(users).limit(1);
  if (existing.length === 0) {
    const hash = await hashPassword("admin");
    await db().insert(users).values({ username: "admin", password_hash: hash });
  }
}
var authActions = {
  async login(username, password) {
    const [user] = await db().select().from(users).where(eq(users.username, username)).limit(1);
    if (!user) {
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      return { success: false, error: "Invalid username or password" };
    }
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return { success: false, error: "Invalid username or password" };
    }
    const token = await createSession(user.id);
    setSessionCookie(token);
    return { success: true, token };
  },
  async logout() {
    const token = getSessionToken();
    if (token) {
      await deleteSession(token);
      clearSessionCookie();
    }
    return { success: true };
  },
  async checkAuth() {
    const user = await getCurrentUser();
    return { authenticated: !!user };
  },
  async loadUser() {
    await ensureDefaultUser();
    return getCurrentUser();
  },
  async getUsers() {
    return db().select({
      id: users.id,
      username: users.username,
      createdAt: users.created_at
    }).from(users).orderBy(users.id);
  },
  async createUser(username, password) {
    const hash = await hashPassword(password);
    const [user] = await db().insert(users).values({ username, password_hash: hash }).returning({ id: users.id });
    return user;
  },
  async updatePassword(userId, newPassword) {
    const hash = await hashPassword(newPassword);
    await db().update(users).set({ password_hash: hash }).where(eq(users.id, userId));
  },
  async deleteUser(userId) {
    await db().delete(users).where(eq(users.id, userId));
  }
};

export {
  authActions
};
