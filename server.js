const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const matter = require("gray-matter");
const { marked } = require("marked");
const { formidable } = require("formidable");
require("dotenv").config();

const PORT = Number(process.env.PORT) || 4321;
const CONTENT_DIR = path.resolve(__dirname, process.env.CONTENT_DIR || "content");
const PUBLIC_DIR = path.resolve(__dirname, process.env.PUBLIC_DIR || "public");
const ADMIN_DIR = path.resolve(__dirname, process.env.ADMIN_DIR || "admin");
const UPLOADS_PATH = process.env.UPLOADS_PATH || "uploads";
const UPLOADS_DIR = path.join(PUBLIC_DIR, UPLOADS_PATH);

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS) || 24 * 60 * 60 * 1000;
const MAX_UPLOAD_SIZE = Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024;

const sessions = new Map();

if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

marked.setOptions({
  gfm: true,
  breaks: true
});

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

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

function createSession() {
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + SESSION_TTL_MS);
  return token;
}

function getSessionToken(req) {
  const cookies = parseCookies(req.headers.cookie || "");
  return cookies.session;
}

function isAuthenticated(req) {
  const token = getSessionToken(req);
  if (!token) {
    return false;
  }

  const expiresAt = sessions.get(token);
  if (!expiresAt || expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }

  return true;
}

function requireAuth(req, res) {
  if (isAuthenticated(req)) {
    return true;
  }

  sendJson(res, 401, { error: "Unauthorized" });
  return false;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getPostFilePath(slug) {
  return path.join(CONTENT_DIR, `${slug}.md`);
}

function readPostFromFile(fileName) {
  const slug = fileName.replace(/\.md$/, "");
  const filePath = getPostFilePath(slug);
  const rawFile = fs.readFileSync(filePath, "utf8");
  const parsed = matter(rawFile);
  const titleFromContent = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim();

  const tags = Array.isArray(parsed.data.tags)
    ? parsed.data.tags.map(tag => String(tag).trim()).filter(Boolean)
    : [];

  const stat = fs.statSync(filePath);
  const metadata = {
    title: parsed.data.title || titleFromContent || slug,
    author: parsed.data.author || "",
    tags,
    date: parsed.data.date || stat.birthtime.toISOString(),
    updated_at: parsed.data.updated_at || stat.mtime.toISOString()
  };

  return {
    slug,
    metadata,
    markdown: parsed.content,
    html: marked.parse(parsed.content)
  };
}

function extractFirstImage(markdown = "") {
  const imageMatch = markdown.match(/!\[[^\]]*\]\(([^)\s]+)[^)]*\)/);
  return imageMatch ? imageMatch[1] : null;
}

function createExcerpt(markdown = "", maxLength = 180) {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\(([^)]+)\)/g, " ")
    .replace(/\[[^\]]*\]\(([^)]+)\)/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return `${plainText.slice(0, maxLength).trimEnd()}...`;
}

function writePostToFile(slug, metadata, markdown) {
  const cleanMetadata = {
    title: metadata.title,
    author: metadata.author || "",
    tags: Array.isArray(metadata.tags) ? metadata.tags : [],
    date: metadata.date,
    updated_at: metadata.updated_at
  };

  const output = matter.stringify(markdown.trim(), cleanMetadata);
  fs.writeFileSync(getPostFilePath(slug), output, "utf8");
}

function getContentType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const map = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "application/javascript",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
  };

  return map[extension] || "application/octet-stream";
}

function serveFile(res, filepath) {
  fs.readFile(filepath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200, { "Content-Type": getContentType(filepath) });
    res.end(data);
  });
}

function servePublicAsset(reqPath, res) {
  const normalizedPath = path.normalize(reqPath).replace(/^\/+/, "");
  const filePath = path.join(PUBLIC_DIR, normalizedPath);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  return serveFile(res, filePath);
}

// -------- SERVER --------
const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = decodeURIComponent(requestUrl.pathname);

  // ===== API: ADMIN LOGIN =====
  if (req.method === "POST" && pathname === "/api/admin/login") {
    readJsonBody(req)
      .then(({ username, password }) => {
        if (username !== ADMIN_USER || password !== ADMIN_PASS) {
          return sendJson(res, 401, { error: "Credenciales inválidas" });
        }

        const token = createSession();
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": `session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_MS / 1000}; SameSite=Lax`
        });
        res.end(JSON.stringify({ ok: true }));
      })
      .catch(() => sendJson(res, 400, { error: "Payload inválido" }));
    return;
  }

  // ===== API: ADMIN LOGOUT =====
  if (req.method === "POST" && pathname === "/api/admin/logout") {
    const token = getSessionToken(req);
    if (token) {
      sessions.delete(token);
    }

    res.writeHead(200, {
      "Content-Type": "application/json",
      "Set-Cookie": "session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  // ===== API: ADMIN SESSION =====
  if (req.method === "GET" && pathname === "/api/admin/session") {
    return sendJson(res, 200, { authenticated: isAuthenticated(req) });
  }

  // ===== API: ADMIN GET RAW POST =====
  if (req.method === "GET" && pathname.startsWith("/api/admin/post/")) {
    if (!requireAuth(req, res)) {
      return;
    }

    const slug = pathname.split("/").pop();
    const filepath = getPostFilePath(slug);

    if (!slug || !fs.existsSync(filepath)) {
      return sendJson(res, 404, { error: "Post no encontrado" });
    }

    const post = readPostFromFile(`${slug}.md`);
    return sendJson(res, 200, {
      slug,
      ...post.metadata,
      markdown: post.markdown
    });
  }

  // ===== API: GET ALL POSTS =====
  if (req.method === "GET" && pathname === "/api/posts") {
    const files = fs.readdirSync(CONTENT_DIR).filter(file => file.endsWith(".md"));

    const posts = files
      .map(file => {
        const post = readPostFromFile(file);
        return {
          slug: post.slug,
          ...post.metadata,
          coverImage: extractFirstImage(post.markdown),
          excerpt: createExcerpt(post.markdown)
        };
      })
      .sort((left, right) => new Date(right.date) - new Date(left.date));

    return sendJson(res, 200, posts);
  }

  // ===== API: GET SINGLE POST =====
  if (req.method === "GET" && pathname.startsWith("/api/post/")) {
    const slug = pathname.split("/").pop();
    const filepath = getPostFilePath(slug);

    if (!slug || !fs.existsSync(filepath)) {
      return sendJson(res, 404, { error: "Post no encontrado" });
    }

    const post = readPostFromFile(`${slug}.md`);

    return sendJson(res, 200, {
      slug,
      ...post.metadata,
      content: post.html
    });
  }

  // ===== API: CREATE POST =====
  if (req.method === "POST" && pathname === "/api/posts") {
    if (!requireAuth(req, res)) {
      return;
    }

    readJsonBody(req)
      .then(payload => {
        const title = String(payload.title || "").trim();
        const markdown = String(payload.content || "");
        const author = String(payload.author || "").trim();
        const tags = String(payload.tags || "")
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean);

        if (!title || !markdown) {
          return sendJson(res, 400, { error: "Título y contenido son obligatorios" });
        }

        const slug = slugify(title);
        if (!slug) {
          return sendJson(res, 400, { error: "No se pudo generar slug" });
        }

        const filepath = getPostFilePath(slug);
        if (fs.existsSync(filepath)) {
          return sendJson(res, 409, { error: "Ya existe un post con ese título" });
        }

        const now = new Date().toISOString();
        writePostToFile(
          slug,
          {
            title,
            author,
            tags,
            date: now,
            updated_at: now
          },
          markdown
        );

        return sendJson(res, 201, { ok: true, slug });
      })
      .catch(() => sendJson(res, 400, { error: "Payload inválido" }));

    return;
  }

  // ===== API: UPDATE POST =====
  if (req.method === "PUT" && pathname.startsWith("/api/posts/")) {
    if (!requireAuth(req, res)) {
      return;
    }

    const slug = pathname.split("/").pop();
    const filepath = getPostFilePath(slug);

    if (!slug || !fs.existsSync(filepath)) {
      return sendJson(res, 404, { error: "Post no encontrado" });
    }

    const existing = readPostFromFile(`${slug}.md`);

    readJsonBody(req)
      .then(payload => {
        const title = String(payload.title || "").trim() || existing.metadata.title;
        const markdown = String(payload.content || "");
        const author = String(payload.author || "").trim();
        const tags = String(payload.tags || "")
          .split(",")
          .map(tag => tag.trim())
          .filter(Boolean);

        if (!title || !markdown) {
          return sendJson(res, 400, { error: "Título y contenido son obligatorios" });
        }

        writePostToFile(
          slug,
          {
            title,
            author,
            tags,
            date: existing.metadata.date,
            updated_at: new Date().toISOString()
          },
          markdown
        );

        return sendJson(res, 200, { ok: true, slug });
      })
      .catch(() => sendJson(res, 400, { error: "Payload inválido" }));

    return;
  }

  // ===== API: UPLOAD IMAGE =====
  if (req.method === "POST" && pathname === "/api/upload-image") {
    if (!requireAuth(req, res)) {
      return;
    }

    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: MAX_UPLOAD_SIZE,
      uploadDir: UPLOADS_DIR,
      filter: part => part.mimetype && part.mimetype.startsWith("image/")
    });

    form.parse(req, (error, fields, files) => {
      if (error) {
        return sendJson(res, 400, { error: "Error al subir imagen" });
      }

      const uploaded = Array.isArray(files.image) ? files.image[0] : files.image;
      if (!uploaded) {
        return sendJson(res, 400, { error: "No se recibió imagen" });
      }

      const extension = path.extname(uploaded.originalFilename || uploaded.newFilename || "").toLowerCase() || ".png";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${extension}`;
      const finalPath = path.join(UPLOADS_DIR, fileName);

      fs.renameSync(uploaded.filepath, finalPath);

      return sendJson(res, 201, { ok: true, url: `/${UPLOADS_PATH}/${fileName}` });
    });

    return;
  }

  // ===== ROUTING =====

  if (pathname === "/") {
    return serveFile(res, path.join(PUBLIC_DIR, "index.html"));
  }

  if (pathname === "/post") {
    return serveFile(res, path.join(PUBLIC_DIR, "post.html"));
  }

  if (pathname === "/admin") {
    return serveFile(res, path.join(ADMIN_DIR, "index.html"));
  }

  if (pathname.startsWith(`/${UPLOADS_PATH}/`)) {
    return servePublicAsset(pathname, res);
  }

  if (pathname === "/style.css") {
    return servePublicAsset(pathname, res);
  }

  res.writeHead(404);
  res.end("Not Found");
});

server.listen(PORT, () => {
  console.log(`🚀 Running at http://localhost:${PORT}`);
});