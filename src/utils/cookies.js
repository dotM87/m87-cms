function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map(part => part.trim())
    .filter(Boolean)
    .reduce((accumulator, pair) => {
      const separatorIndex = pair.indexOf("=");
      if (separatorIndex === -1) {
        return accumulator;
      }

      const key = pair.slice(0, separatorIndex);
      const value = decodeURIComponent(pair.slice(separatorIndex + 1));
      accumulator[key] = value;
      return accumulator;
    }, {});
}

function isSecureRequest(req) {
  if (req.secure) {
    return true;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (typeof forwardedProto === "string") {
    return forwardedProto.split(",")[0].trim().toLowerCase() === "https";
  }

  return false;
}

function buildSessionCookie(req, token, maxAgeSeconds, sameSite) {
  const cookieParts = [
    `session=${token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${maxAgeSeconds}`,
    `SameSite=${sameSite}`
  ];

  if (isSecureRequest(req)) {
    cookieParts.push("Secure");
  }

  return cookieParts.join("; ");
}

module.exports = {
  parseCookies,
  buildSessionCookie
};
