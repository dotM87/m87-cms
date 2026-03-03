const bcrypt = require("bcryptjs");
const { ADMIN_PASS_HASH, ADMIN_PASS, ADMIN_USER, COOKIE_SAME_SITE, SESSION_TTL_MS } = require("../config/env");
const { parseCookies, buildSessionCookie } = require("../utils/cookies");
const sessionService = require("./sessionService");

async function verifyAdminPassword(password) {
  if (ADMIN_PASS_HASH) {
    return bcrypt.compare(password, ADMIN_PASS_HASH);
  }
  return password === ADMIN_PASS;
}

function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies.session;
}

function getAuthState(req) {
  const token = getSessionToken(req);
  if (!token) {
    return { authenticated: false, token: null };
  }

  const expiresAt = sessionService.getSessionExpiration(token);
  if (!expiresAt || expiresAt < Date.now()) {
    sessionService.deleteSession(token);
    return { authenticated: false, token: null };
  }

  return { authenticated: true, token };
}

async function login(req, username, password) {
  const isValidPassword = await verifyAdminPassword(String(password || ""));
  if (username !== ADMIN_USER || !isValidPassword) {
    return null;
  }

  const token = sessionService.createSession();
  const cookie = buildSessionCookie(req, token, SESSION_TTL_MS / 1000, COOKIE_SAME_SITE);
  return { token, cookie };
}

function logout(req) {
  const token = getSessionToken(req);
  if (token) {
    sessionService.deleteSession(token);
  }

  return buildSessionCookie(req, "", 0, COOKIE_SAME_SITE);
}

module.exports = {
  getAuthState,
  login,
  logout
};
