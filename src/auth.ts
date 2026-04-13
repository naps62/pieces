import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  getCookie,
  setCookie,
  deleteCookie,
} from "@tanstack/react-start/server";
import * as schema from "./schema";

const SESSION_COOKIE = "session_token";
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const BCRYPT_ROUNDS = 12;

function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return drizzle(postgres(connectionString, { max: 5 }), { schema });
}

let _db: ReturnType<typeof getDb> | null = null;
function db() {
  if (!_db) _db = getDb();
  return _db;
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

async function createSession(userId: number): Promise<string> {
  const token = globalThis.crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db().insert(schema.sessions).values({
    user_id: userId,
    token,
    expires_at: expiresAt,
  });
  return token;
}

async function validateSession(
  token: string,
): Promise<{ userId: number; username: string } | null> {
  const [session] = await db()
    .select({
      userId: schema.sessions.user_id,
      username: schema.users.username,
      expiresAt: schema.sessions.expires_at,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.user_id, schema.users.id))
    .where(
      and(
        eq(schema.sessions.token, token),
        gt(schema.sessions.expires_at, new Date()),
      ),
    )
    .limit(1);

  if (!session) return null;
  return { userId: session.userId, username: session.username };
}

async function deleteSession(token: string): Promise<void> {
  await db()
    .delete(schema.sessions)
    .where(eq(schema.sessions.token, token));
}

function getSessionToken(): string | undefined {
  return getCookie(SESSION_COOKIE);
}

function setSessionCookie(token: string): void {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1000),
  });
}

function clearSessionCookie(): void {
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

async function getCurrentUser(): Promise<{
  userId: number;
  username: string;
} | null> {
  const token = getSessionToken();
  if (!token) return null;
  return validateSession(token);
}

async function ensureDefaultUser(): Promise<void> {
  const existing = await db()
    .select({ id: schema.users.id })
    .from(schema.users)
    .limit(1);
  if (existing.length === 0) {
    const hash = await hashPassword("admin");
    await db()
      .insert(schema.users)
      .values({ username: "admin", password_hash: hash });
  }
}

export const authActions = {
  async login(
    username: string,
    password: string,
  ): Promise<
    { success: true; token: string } | { success: false; error: string }
  > {
    const [user] = await db()
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);

    if (!user) {
      // Constant-time: hash anyway to prevent timing attacks
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

  async logout(): Promise<{ success: true }> {
    const token = getSessionToken();
    if (token) {
      await deleteSession(token);
      clearSessionCookie();
    }
    return { success: true };
  },

  async checkAuth(): Promise<{ authenticated: boolean }> {
    const user = await getCurrentUser();
    return { authenticated: !!user };
  },

  async loadUser(): Promise<{ userId: number; username: string } | null> {
    await ensureDefaultUser();
    return getCurrentUser();
  },

  async getUsers(): Promise<
    { id: number; username: string; createdAt: Date }[]
  > {
    return db()
      .select({
        id: schema.users.id,
        username: schema.users.username,
        createdAt: schema.users.created_at,
      })
      .from(schema.users)
      .orderBy(schema.users.id);
  },

  async createUser(
    username: string,
    password: string,
  ): Promise<{ id: number }> {
    const hash = await hashPassword(password);
    const [user] = await db()
      .insert(schema.users)
      .values({ username, password_hash: hash })
      .returning({ id: schema.users.id });
    return user;
  },

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const hash = await hashPassword(newPassword);
    await db()
      .update(schema.users)
      .set({ password_hash: hash })
      .where(eq(schema.users.id, userId));
  },

  async deleteUser(userId: number): Promise<void> {
    await db()
      .delete(schema.users)
      .where(eq(schema.users.id, userId));
  },
};
