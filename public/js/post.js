import { bindThemeToggle, initTheme } from "/js/theme.js";

function renderPost(post) {
  document.getElementById("post-title").textContent = post.title || post.slug;
  document.getElementById("post-meta").textContent = `${post.author || "Sin autor"} · ${new Date(post.date).toLocaleString()}`;
  const tags = document.getElementById("post-tags");
  tags.innerHTML = (post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("");
  document.getElementById("post").innerHTML = post.content;
}

async function loadPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const response = await fetch(`/api/post/${slug}`);
  const post = await response.json();
  renderPost(post);
}

initTheme();
bindThemeToggle("theme-toggle");
loadPost();
