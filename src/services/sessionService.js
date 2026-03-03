const crypto = require("crypto");
const { SESSION_TTL_MS } = require("../config/env");

const sessions = new Map();

function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function getSessionExpiration(token) {
  return sessions.get(token);
}

function deleteSession(token) {
  sessions.delete(token);
}

module.exports = {
  createSession,
  getSessionExpiration,
  deleteSession
};
