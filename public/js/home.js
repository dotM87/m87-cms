import { bindThemeToggle, initTheme } from "/js/theme.js";

function renderEmptyState() {
  const featured = document.getElementById("featured");
  featured.innerHTML = '<article class="hero-card"><div class="hero-content"><h2>Sin publicaciones</h2><p class="post-meta">Aún no hay contenido para mostrar.</p></div></article>';
}

function renderFeatured(post) {
  const featured = document.getElementById("featured");
  const leadAuthor = post.author || "Sin autor";
  const leadWhen = new Date(post.date).toLocaleString();
  const leadTitle = post.title || post.slug;
  const leadImage = post.coverImage || "";
  const leadExcerpt = post.excerpt || "Contenido destacado del día.";

  featured.innerHTML = `
    <article class="hero-card">
      ${leadImage
        ? `<a href="/post?slug=${post.slug}" class="hero-media-link"><img src="${leadImage}" alt="${leadTitle}" class="hero-media" /></a>`
        : `<a href="/post?slug=${post.slug}" class="hero-media-link hero-media-placeholder" aria-label="${leadTitle}"></a>`}
      <div class="hero-content">
        <p class="kicker">Destacado</p>
        <h2 class="hero-title"><a href="/post?slug=${post.slug}">${leadTitle}</a></h2>
        <p class="hero-excerpt">${leadExcerpt}</p>
        <p class="post-meta">${leadAuthor} · ${leadWhen}</p>
      </div>
    </article>
  `;
}

function renderNews(posts) {
  const container = document.getElementById("posts");
  container.innerHTML = posts
    .map(post => {
      const author = post.author || "Sin autor";
      const when = new Date(post.date).toLocaleString();
      const title = post.title || post.slug;
      const image = post.coverImage || "";
      const excerpt = post.excerpt || "Lee la noticia completa para más detalles.";

      return `
        <article class="news-card">
          ${image
            ? `<a href="/post?slug=${post.slug}" class="news-media-link"><img src="${image}" alt="${title}" class="news-media" /></a>`
            : `<a href="/post?slug=${post.slug}" class="news-media-link news-media-placeholder" aria-label="${title}"></a>`}
          <div class="news-body">
            <h2 class="post-title"><a href="/post?slug=${post.slug}">${title}</a></h2>
            <p class="news-excerpt">${excerpt}</p>
            <p class="post-meta">${author} · ${when}</p>
          </div>
        </article>
      `;
    })
    .join("");
}

async function loadPosts() {
  const response = await fetch("/api/posts");
  if (!response.ok) {
    throw new Error("No se pudieron cargar los posts");
  }

  const posts = await response.json();

  if (!posts.length) {
    renderEmptyState();
    return;
  }

  const [leadPost, ...rest] = posts;
  renderFeatured(leadPost);
  renderNews(rest);
}

initTheme();
bindThemeToggle("theme-toggle");
loadPosts().catch(() => {
  renderEmptyState();
});
