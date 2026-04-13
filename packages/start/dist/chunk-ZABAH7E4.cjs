"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }



var _chunkOEQDKSXKcjs = require('./chunk-OEQDKSXK.cjs');

// src/auth.ts
var _postgresjs = require('drizzle-orm/postgres-js');
var _postgres = require('postgres'); var _postgres2 = _interopRequireDefault(_postgres);
var _drizzleorm = require('drizzle-orm');
var _bcryptjs = require('bcryptjs'); var _bcryptjs2 = _interopRequireDefault(_bcryptjs);




var _server = require('@tanstack/react-start/server');
var SESSION_COOKIE = "session_token";
var SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1e3;
var BCRYPT_ROUNDS = 12;
function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return _postgresjs.drizzle.call(void 0, _postgres2.default.call(void 0, connectionString, { max: 5 }), { schema: _chunkOEQDKSXKcjs.schema_exports });
}
var _db = null;
function db() {
  if (!_db) _db = getDb();
  return _db;
}
async function hashPassword(password) {
  return _bcryptjs2.default.hash(password, BCRYPT_ROUNDS);
}
async function verifyPassword(password, hash) {
  return _bcryptjs2.default.compare(password, hash);
}
async function createSession(userId) {
  const token = globalThis.crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await db().insert(_chunkOEQDKSXKcjs.sessions).values({
    user_id: userId,
    token,
    expires_at: expiresAt
  });
  return token;
}
async function validateSession(token) {
  const [session] = await db().select({
    userId: _chunkOEQDKSXKcjs.sessions.user_id,
    username: _chunkOEQDKSXKcjs.users.username,
    expiresAt: _chunkOEQDKSXKcjs.sessions.expires_at
  }).from(_chunkOEQDKSXKcjs.sessions).innerJoin(_chunkOEQDKSXKcjs.users, _drizzleorm.eq.call(void 0, _chunkOEQDKSXKcjs.sessions.user_id, _chunkOEQDKSXKcjs.users.id)).where(
    _drizzleorm.and.call(void 0, 
      _drizzleorm.eq.call(void 0, _chunkOEQDKSXKcjs.sessions.token, token),
      _drizzleorm.gt.call(void 0, _chunkOEQDKSXKcjs.sessions.expires_at, /* @__PURE__ */ new Date())
    )
  ).limit(1);
  if (!session) return null;
  return { userId: session.userId, username: session.username };
}
async function deleteSession(token) {
  await db().delete(_chunkOEQDKSXKcjs.sessions).where(_drizzleorm.eq.call(void 0, _chunkOEQDKSXKcjs.sessions.token, token));
}
function getSessionToken() {
  return _server.getCookie.call(void 0, SESSION_COOKIE);
}
function setSessionCookie(token) {
  _server.setCookie.call(void 0, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_DURATION_MS / 1e3)
  });
}
function clearSessionCookie() {
  _server.deleteCookie.call(void 0, SESSION_COOKIE, { path: "/" });
}
async function getCurrentUser() {
  const token = getSessionToken();
  if (!token) return null;
  return validateSession(token);
}
async function ensureDefaultUser() {
  const existing = await db().select({ id: _chunkOEQDKSXKcjs.users.id }).from(_chunkOEQDKSXKcjs.users).limit(1);
  if (existing.length === 0) {
    const hash = await hashPassword("admin");
    await db().insert(_chunkOEQDKSXKcjs.users).values({ username: "admin", password_hash: hash });
  }
}
var authActions = {
  async login(username, password) {
    const [user] = await db().select().from(_chunkOEQDKSXKcjs.users).where(_drizzleorm.eq.call(void 0, _chunkOEQDKSXKcjs.users.username, username)).limit(1);
    if (!user) {
      await _bcryptjs2.default.hash(password, BCRYPT_ROUNDS);
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
      id: _chunkOEQDKSXKcjs.users.id,
      username: _chunkOEQDKSXKcjs.users.username,
      createdAt: _chunkOEQDKSXKcjs.users.created_at
    }).from(_chunkOEQDKSXKcjs.users).orderBy(_chunkOEQDKSXKcjs.users.id);
  },
  async createUser(username, password) {
    const hash = await hashPassword(password);
    const [user] = await db().insert(_chunkOEQDKSXKcjs.users).values({ username, password_hash: hash }).returning({ id: _chunkOEQDKSXKcjs.users.id });
    return user;
  },
  async updatePassword(userId, newPassword) {
    const hash = await hashPassword(newPassword);
    await db().update(_chunkOEQDKSXKcjs.users).set({ password_hash: hash }).where(_drizzleorm.eq.call(void 0, _chunkOEQDKSXKcjs.users.id, userId));
  },
  async deleteUser(userId) {
    await db().delete(_chunkOEQDKSXKcjs.users).where(_drizzleorm.eq.call(void 0, _chunkOEQDKSXKcjs.users.id, userId));
  }
};



exports.authActions = authActions;
