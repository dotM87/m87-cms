const matter = require("gray-matter");
const { marked } = require("marked");
const sanitizeHtml = require("sanitize-html");
const contentRepository = require("../repositories/contentRepository");
const { slugify } = require("../utils/slug");
const { AppError } = require("../utils/httpError");

marked.setOptions({
  gfm: true,
  breaks: true
});

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

function parseTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags.map(tag => String(tag).trim()).filter(Boolean);
  }

  return String(rawTags || "")
    .split(",")
    .map(tag => tag.trim())
    .filter(Boolean);
}

function readPostBySlug(slug) {
  const rawFile = contentRepository.readPostRawBySlug(slug);
  const parsed = matter(rawFile);
  const titleFromContent = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim();
  const stat = contentRepository.readPostStatBySlug(slug);

  const metadata = {
    title: parsed.data.title || titleFromContent || slug,
    author: parsed.data.author || "",
    tags: parseTags(parsed.data.tags),
    date: parsed.data.date || stat.birthtime.toISOString(),
    updated_at: parsed.data.updated_at || stat.mtime.toISOString()
  };

  const html = sanitizeHtml(marked.parse(parsed.content), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "span"]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title"],
      "*": ["class", "id"]
    },
    allowedSchemes: ["http", "https", "mailto", "data"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"]
    }
  });

  return {
    slug,
    metadata,
    markdown: parsed.content,
    html
  };
}

function listPosts() {
  const files = contentRepository.listPostFiles();
  return files
    .map(file => {
      const slug = file.replace(/\.md$/, "");
      const post = readPostBySlug(slug);
      return {
        slug: post.slug,
        ...post.metadata,
        coverImage: extractFirstImage(post.markdown),
        excerpt: createExcerpt(post.markdown)
      };
    })
    .sort((left, right) => new Date(right.date) - new Date(left.date));
}

function getPublicPost(slug) {
  if (!slug || !contentRepository.postExists(slug)) {
    throw new AppError(404, "Post no encontrado");
  }

  const post = readPostBySlug(slug);
  return {
    slug,
    ...post.metadata,
    content: post.html
  };
}

function getAdminPost(slug) {
  if (!slug || !contentRepository.postExists(slug)) {
    throw new AppError(404, "Post no encontrado");
  }

  const post = readPostBySlug(slug);
  return {
    slug,
    ...post.metadata,
    markdown: post.markdown
  };
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
  contentRepository.writePostBySlug(slug, output);
}

function createPost(payload) {
  const title = String(payload.title || "").trim();
  const markdown = String(payload.content || "");
  const author = String(payload.author || "").trim();
  const tags = parseTags(payload.tags);

  if (!title || !markdown) {
    throw new AppError(400, "Título y contenido son obligatorios");
  }

  const slug = slugify(title);
  if (!slug) {
    throw new AppError(400, "No se pudo generar slug");
  }

  if (contentRepository.postExists(slug)) {
    throw new AppError(409, "Ya existe un post con ese título");
  }

  const now = new Date().toISOString();
  writePostToFile(slug, { title, author, tags, date: now, updated_at: now }, markdown);
  return { ok: true, slug };
}

function updatePost(slug, payload) {
  if (!slug || !contentRepository.postExists(slug)) {
    throw new AppError(404, "Post no encontrado");
  }

  const existing = readPostBySlug(slug);
  const title = String(payload.title || "").trim() || existing.metadata.title;
  const markdown = String(payload.content || "");
  const author = String(payload.author || "").trim();
  const tags = parseTags(payload.tags);

  if (!title || !markdown) {
    throw new AppError(400, "Título y contenido son obligatorios");
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

  return { ok: true, slug };
}

module.exports = {
  listPosts,
  getPublicPost,
  getAdminPost,
  createPost,
  updatePost
};
