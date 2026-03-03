const authService = require("../services/authService");
const rateLimitService = require("../services/rateLimitService");
const { AppError } = require("../utils/httpError");

async function login(req, res) {
  if (rateLimitService.isRateLimited(req, "login", 10, 15 * 60 * 1000)) {
    throw new AppError(429, "Demasiados intentos. Intenta más tarde.");
  }

  const username = String(req.body?.username || "");
  const password = String(req.body?.password || "");
  const result = await authService.login(req, username, password);

  if (!result) {
    throw new AppError(401, "Credenciales inválidas");
  }

  res.setHeader("Set-Cookie", result.cookie);
  res.status(200).json({ ok: true });
}

function logout(req, res) {
  const cookie = authService.logout(req);
  res.setHeader("Set-Cookie", cookie);
  res.status(200).json({ ok: true });
}

function session(req, res) {
  res.status(200).json({ authenticated: Boolean(req.auth?.authenticated) });
}

module.exports = {
  login,
  logout,
  session
};
