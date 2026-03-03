const rateLimitStore = new Map();

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function isRateLimited(req, bucket, limit, windowMs) {
  const now = Date.now();
  const key = `${bucket}:${getClientIp(req)}`;
  const existing = rateLimitStore.get(key);

  if (!existing || existing.expiresAt < now) {
    rateLimitStore.set(key, { count: 1, expiresAt: now + windowMs });
    return false;
  }

  if (existing.count >= limit) {
    return true;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return false;
}

module.exports = {
  isRateLimited
};
